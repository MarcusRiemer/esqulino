class GrammarBasedOnCodeResource < ActiveRecord::Migration[6.0]
  def change
    add_reference :grammars,            # Table
                  :generated_from,      # Column name
                  index: true,
                  null: true,
                  type: :uuid,
                  foreign_key: { to_table: :code_resources }
  end
end
