module Types
  class Types::SqlForeignKeyReferenceType < Types::Base::BaseObject
    field :to_table, String, null: false
    field :to_column, String, null: false
    field :from_column, String, null: false

    def to_table
      object["toTable"]
    end

    def to_column
      object["toColumn"]
    end

    def from_column
      object["fromColumn"]
    end
  end

  class Types::SqlForeignKeyType < Types::Base::BaseObject
    field :references, [SqlForeignKeyReferenceType], null: false
  end
end