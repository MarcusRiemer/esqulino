module Types
  class Types::SqlTableType < Types::Base::BaseObject
    field :name, String, null: false
    field :columns, [SqlColumnType], null: false
    field :foreign_keys, [SqlForeignKeyType], null: false
    field :system_table, Boolean, null: false

    def foreign_keys
      object['foreignKeys']
    end

    def system_table
      object['systemTable']
    end
  end
end
