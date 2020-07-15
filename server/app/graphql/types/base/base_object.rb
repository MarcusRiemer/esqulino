module Types
  class Types::Base::BaseObject < GraphQL::Schema::Object
    field_class Types::Base::BaseField
    connection_type_class  Types::Base::BaseConnection
    DEFAULT_PAGE_SIZE = 25
    MAX_PAGE_SIZE = 100

    def normalize_keys(object)
      object.as_json.transform_keys{|key| key.underscore.to_s}
    end

  end
end
