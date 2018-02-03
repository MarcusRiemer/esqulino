class Jsonb < ActiveRecord::Migration[5.1]
  def up
    change_column :block_languages, :model, :jsonb
    change_column :code_resources, :ast, :jsonb
  end

  def down
    change_column :block_languages, :model, :json
    change_column :code_resources, :ast, :json
  end
end
