module Types
  class Types::SqlTableType < Types::Base::BaseObject
    field :name, String, null: false
    field :columns, [SqlColumnType], null: false
    field :foreign_keys, [SqlForeignKeyType], null: false
    field :systemTable, Boolean, null: false
  end
end