class RemoveBlockLanguageGeneratorTargetName < ActiveRecord::Migration[5.1]
  def change
    remove_column :block_language_generators, :target_name
  end
end
