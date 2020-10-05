module Types
  class Types::SqlColumnType < Types::Base::BaseObject
    field :index, Integer, null: false
    field :name, String, null: false
    field :type, String, null: false
    field :not_null, Boolean, null: false
    field :dflt_value, String, null: true
    field :primary, Boolean, null: false

    def not_null
      object["notNull"]
    end

    def dflt_value
      object["dfltValue"]
    end
  end
end
