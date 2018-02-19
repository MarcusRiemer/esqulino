class AddAvailableBlockLanguagesToProject < ActiveRecord::Migration[5.1]
  def change
    create_table :block_languages_projects, id: false do |t|
      t.references :block_language, type: :uuid, index: true
      t.references :project, type: :uuid, index: true
    end

    add_foreign_key :block_languages_projects, :block_languages
    add_foreign_key :block_languages_projects, :projects
  end
end
