class AlterPublicDefaultValueToProjects < ActiveRecord::Migration[5.1]
  def change
    change_column :projects, :public, :boolean, default: true, null: false
  end
end
