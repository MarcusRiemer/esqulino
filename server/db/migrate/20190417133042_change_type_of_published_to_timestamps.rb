class ChangeTypeOfPublishedToTimestamps < ActiveRecord::Migration[5.2]
  def change
    change_column(:news, :published_from, :timestamp)
  end
end
