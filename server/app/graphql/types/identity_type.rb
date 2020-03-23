
module Types
  class Types::IdentityType < GraphQL::Schema::Object
    field :provider, String, null:true
    field :type, String, null:true
    field :providerData, Types::Json, null:true
    field :own_data, Types::Json, null:true
    field :user, Types::UserType,null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
  end
end
