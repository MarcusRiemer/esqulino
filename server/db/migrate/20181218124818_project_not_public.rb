class ProjectNotPublic < ActiveRecord::Migration[5.2]
  def change
    change_column_default :projects, :public, from: true, to: false
  end
end
