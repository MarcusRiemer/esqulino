class RemoveApiVersionFromProject < ActiveRecord::Migration[6.0]
  def change
    remove_column :projects, :api_version
  end
end
