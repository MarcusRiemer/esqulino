module Types
  class Types::ProjectSourceType < GraphQL::Schema::Object
    field :project, Types::ProjectType, null:true
    field :url, String, null:true
    field :title, String, null:true
    field :display, String, null:true
    field :readOnly, Boolean,null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
  end
end