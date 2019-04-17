class ChangeMigration < ActiveRecord::Migration[5.2]
  def change
    rename_column :news, :publish_from, :published_from
    change_column(:news, :published_from, :timestamp)
  end
end
