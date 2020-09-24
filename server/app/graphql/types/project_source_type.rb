module Types
  class ProjectSourceKindType < Types::Base::BaseEnum
    value 'data'
  end

  class Types::ProjectSourceType < Types::Base::BaseObject
    field :id, ID, null:false
    field :project, Types::ProjectType, null:false
    field :url, String, null:false
    field :title, String, null:false
    field :kind, ProjectSourceKindType, null:false
    field :read_only, Boolean,null:false

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
  end
end