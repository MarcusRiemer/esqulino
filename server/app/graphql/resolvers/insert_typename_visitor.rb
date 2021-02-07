module Resolvers
  # Adds the `__typename` field that is required for the client side
  # type checking to every queried model
  class InsertTypenameVisitor < GraphQL::Language::Visitor
    def on_field(node, parent)
      names = node.selections.map { |s| s.name }
      if not names.empty? and not names.include? "__typename"
        typename_node = GraphQL::Language::Nodes::Field.new(name: "__typename");
        node = node.merge(selections: node.selections + [typename_node])
      end
      super
    end
  end
end