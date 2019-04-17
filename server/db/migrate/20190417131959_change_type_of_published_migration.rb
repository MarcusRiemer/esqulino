class ChangeTypeOfPublishedMigration < ActiveRecord::Migration[5.2]
  def change
    change_column(:news, :published_from, :datetime)
  end
end
