class ProjectDatabaseRegenerateSchema < ActiveRecord::Migration[6.0]
  def change
    ProjectDatabase.all.each do |db|
      db.refresh_schema!
    end
  end
end
