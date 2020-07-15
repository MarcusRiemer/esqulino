class GrammarExtends < ActiveRecord::Migration[6.0]
  def change
    add_reference :grammars,            # Table
                  :extends,             # Column name
                  index: true,
                  null: true,
                  type: :uuid,
                  foreign_key: { to_table: :grammars }
  end
end
