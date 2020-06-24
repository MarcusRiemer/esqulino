module Types
  class Types::Base::BaseObject < GraphQL::Schema::Object
    field_class Types::Base::BaseField
    connection_type_class  Types::Base::BaseConnection
    DEFAULT_PAGE_SIZE = 25
    MAX_PAGE_SIZE = 100

    field :id, ID, null:false

    def id
      object.id
    end
  end
end
