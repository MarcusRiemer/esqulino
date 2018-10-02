class RemoveBlockLanguageFamily < ActiveRecord::Migration[5.1]
  def change
    remove_column :block_languages, :family
  end
end
