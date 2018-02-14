class AddApiVersionToProject < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :api_version, :integer
  end
end
