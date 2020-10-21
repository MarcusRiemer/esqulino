class ServerSchema < GraphQL::Schema
  default_max_page_size 100
  # required
  mutation(Types::MutationType)
  query(Types::QueryType)

  # optional
  # Opt in to the new runtime (default in future graphql-ruby versions)
  use GraphQL::Execution::Interpreter
  use GraphQL::Analysis::AST

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections
end
