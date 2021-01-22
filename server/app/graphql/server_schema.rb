class ServerSchema < GraphQL::Schema
  default_max_page_size 100
  # Required basic schema parts
  mutation(Types::MutationType)
  query(Types::QueryType)
end
