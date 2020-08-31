module Types
  class Types::ProjectSourceType < Types::Base::BaseObject
    field :id, ID, null:false
    field :project, Types::ProjectType, null:false
    field :url, String, null:false
    field :title, String, null:false
    field :display, String, null:false
    field :readOnly, Boolean,null:false

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
  end
end