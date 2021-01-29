require "rails_helper"

RSpec.describe Resolvers::BaseResolver do

  class RelatedModelsVisitor < GraphQL::Language::Visitor

    def self.calculate(query_string)
      document = GraphQL.parse(query_string)
      vis = RelatedModelsVisitor.new(document)
      vis.visit

      return vis.includes
    end

    def initialize(*args)
      super
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
      first_nodes_index = stack.find_index { |n| n.name == "nodes" }
      if first_nodes_index
        # Drop everything before the first "nodes", this should
        # only be the name of the query entry point which has no
        # counterpart in the active record models
        model_stack = stack.drop first_nodes_index
        # Drop all intermediate nodes
        return model_stack.filter { |n| n.name != "nodes" }
      else
        return []
      end
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

  it "Two levels nested, surrounded by scalars" do
    query_string = <<-EOQ
      query AdminListGrammars {
        grammars {
          nodes {
            name
            generatedFrom {
              name
              project {
                name
              }
              id
            }
            id
          }
          totalCount
        }
      }
    EOQ

    includes = RelatedModelsVisitor.calculate query_string
    expect(includes).to eq({ "generated_from" => { "project" => {} } })
  end

  it "One levels nested" do
    query_string = <<-EOQ
      query AdminListGrammars {
        grammars {
          nodes {
            name
            generatedFrom {
              name
            }
          }
        }
      }
    EOQ

    includes = RelatedModelsVisitor.calculate query_string
    expect(includes).to eq({ "generated_from" => {} })
  end
end