module Resolvers
  class RelatedModelsVisitor < GraphQL::Language::Visitor

    def self.calculate(query_string, root_model_class)
      document = GraphQL.parse(query_string)
      vis = RelatedModelsVisitor.new(document, root_model_class)
      vis.visit

      return vis.includes
    end

    def initialize(document, root_model_class)
      super(document)
      @root_model_class = root_model_class
      @stack = []
      @includes = Hash.new
    end

    attr_reader :includes

    def on_field(node, parent)
      # Is this a different parent?
      if @stack.last != parent
        # Do we need to jump unwind to a specific place?
        parent_index = @stack.find_index parent
        if parent_index
          # jump back to the place where the parent is
          @stack = @stack[0..parent_index]
        else
          # welcome the new parent to the family
          @stack.push parent
        end
      end

      # Only include elements in the stack that could be active record attributes
      curr_stack_model_attributes = stack_model_attributes(@stack)

      # Skip levels that have nothing to do with the active record layer
      # This means we want to chime in as soon as we hit the first children
      # of the "nodes" level or have already built a stack
      if (parent.name == "nodes" or curr_stack_model_attributes.length > 0)
        if is_scalar_node node
        # Helpful debug output to ensure that the model attribute stack seems sane
        # puts curr_stack_model_attributes.map {|e| e.name}.join("->") + "::" + node.name
        else
          # Actually add this non-scalar field to the stack
          add_nested_include(curr_stack_model_attributes, node.name, @includes)
          # puts @includes
        end
      end

      # Continue visiting
      super
    end

    def is_scalar_node(node)
      node.selections.length == 0
    end

    # Returns a new stack that probably only contains items that have
    # matching fields in the models
    def stack_model_attributes(stack)
      curr_class = @root_model_class
      curr_associations = curr_class.reflect_on_all_associations
      model_stack = []
      in_model_associations = false

      # Now walk the stack and check
      stack.each do |stack_node|
        matching_association = curr_associations.find {|a| a.name == stack_node.name.underscore.to_sym }

        if matching_association
          # No matter whether this is the first time: We are now in the active record chain
          in_model_associations = true

          curr_class = matching_association.klass
          curr_associations = curr_class.reflect_on_all_associations

          model_stack << stack_node
        elsif in_model_associations
          # Ouch, there might be a non active record association here, e.g.
          # the "nodes" layer of GrahQL ... We better treat this as
          # an error for the moment
          raise RuntimeError, "Unknown attribute #{stack_node.name} in model association stack"
        elsif stack_node.name == "nodes"
          # The special name "nodes" denotes that the children (in the
          # next iteration) must be models
          in_model_associations = true
        end
      end

      return model_stack
    end



    # Adds the new include at the given path in the includes-hash. This
    # method assumes that all keys in the resulting hash should be in "snake_case"
    #
    # @param model_stack [String[]] The path to the new include
    # @param new_include [String]   The name of the new include
    # @param curr                   The nested includes hash to modify
    def add_nested_include(model_stack, new_include, curr)
      if model_stack.empty?
        curr[new_include.underscore] = Hash.new
      else
        # Extract the key from the node in the stack. We assume it
        # will use snake_case
        curr_key = model_stack.first.name.underscore
        add_nested_include(model_stack.drop(1), new_include, curr[curr_key])
      end
    end
  end
end
