module Types
  class Types::ProjectSourceType < Types::BaseObject
    field :project, Types::ProjectType, null:false
    field :url, String, null:false
    field :title, String, null:false
    field :display, String, null:false
    field :readOnly, Boolean,null:false
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
  end
end