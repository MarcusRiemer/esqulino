module Types
  class Types::UserType < GraphQL::Schema::Object
    field :displayName, String, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :email, String, null:true
    field :projects, [Types::ProjectType],null:true
    field :identities, [Types::IdentityType], null:true
    field :news, [Types::NewsType],null:true
  end
end