class ChangeApiVersionTypeInProjects < ActiveRecord::Migration[5.1]
  def change
    change_column :projects, :api_version, :string
  end
end
