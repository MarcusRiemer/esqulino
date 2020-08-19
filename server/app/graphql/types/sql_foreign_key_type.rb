module Types
  class Types::SqlForeignKeyReferenceType < Types::Base::BaseObject
    field :toTable, String, null: false
    field :toColumn, String, null: false
    field :fromColumn, String, null: false
  end

  class Types::SqlForeignKeyType < Types::Base::BaseObject
    field :references, [SqlForeignKeyReferenceType], null: false
  end
end