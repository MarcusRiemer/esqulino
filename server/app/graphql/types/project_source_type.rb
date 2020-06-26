module Types
  class Types::ProjectSourceType < Types::Base::BaseObject
    field :id, ID, null:false
    field :project, Types::ProjectType, null:false
    field :url, String, null:false
    field :title, String, null:false
    field :display, String, null:false
    field :readOnly, Boolean,null:false
    field :createdAt, Types::Scalar::Datetime, null:true
    field :updatedAt, Types::Scalar::Datetime, null:true
  end
end