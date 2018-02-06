class CodeResourceAddCompiled < ActiveRecord::Migration[5.1]
  def change
    add_column :code_resources, :compiled, :string
  end
end
