module Types
  class Types::UserType < Types::Base::BaseObject
    field :roles, Types::RoleType, null:false
    field :displayName, String, null:true

    field :createdAt, Types::Scalar::Datetime, null:false
    field :updatedAt, Types::Scalar::Datetime, null:false
    field :email, String, null:true
    field :projects, [Types::ProjectType],null:true
    field :identities, [Types::IdentityType], null:true
    field :news, [Types::NewsType],null:true
  end
end