module Types
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField
    connection_type_class  BaseConnection
    DEFAULT_PAGE_SIZE = 25
    MAX_PAGE_SIZE = 100

    field :id, ID, null:false

    def id
      object.id
    end
  end
end
