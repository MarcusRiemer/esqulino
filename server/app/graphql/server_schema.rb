class ServerSchema < GraphQL::Schema
  default_max_page_size 100

  # Required basic schema parts
  mutation(Types::MutationType)
  query(Types::QueryType)

  # No need to allow introspection for live environments
  disable_introspection_entry_points if Rails.env.production?
end
