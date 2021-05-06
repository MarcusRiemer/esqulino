class BlockLanguageBasedOnCodeResource < ActiveRecord::Migration[6.1]
  def change
    add_reference :block_languages,     # Table
                  :generated_from,      # Column name
                  index: true,
                  null: true,
                  type: :uuid,
                  foreign_key: { to_table: :code_resources }
  end
end
