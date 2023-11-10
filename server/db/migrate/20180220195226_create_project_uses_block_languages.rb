class CreateProjectUsesBlockLanguages < ActiveRecord::Migration[5.1]
  def change
    rename_table :block_languages_projects, :project_uses_block_languages
    add_index :project_uses_block_languages,
              %i[project_id block_language_id],
              unique: true,
              name: 'block_languages_projects_unique'
  end
end
