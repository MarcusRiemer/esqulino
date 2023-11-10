class AddPrimaryKeyToProjectUsesBlockLanguage < ActiveRecord::Migration[5.1]
  def change
    drop_table :project_uses_block_languages

    create_table :project_uses_block_languages, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :block_language, type: :uuid, index: true
      t.references :project, type: :uuid, index: true
    end

    add_foreign_key :project_uses_block_languages, :block_languages
    add_foreign_key :project_uses_block_languages, :projects

    # Adding languages twice is not allowed
    add_index :project_uses_block_languages,
              %i[project_id block_language_id],
              unique: true,
              name: 'block_languages_projects_unique'
  end
end
