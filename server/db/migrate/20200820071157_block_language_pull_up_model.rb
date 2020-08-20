class BlockLanguagePullUpModel < ActiveRecord::Migration[6.0]
  # Ensure that a model class for this migration is available
  # https://railsguides.net/change-data-in-migrations-like-a-boss/
  class BlockLanguage < ActiveRecord::Base
  end

  def change
    add_column :block_languages, :sidebars, :jsonb, :default => []
    add_column :block_languages, :editor_blocks, :jsonb, :default => []
    add_column :block_languages, :editor_components, :jsonb, :default => []
    add_column :block_languages, :local_generator_instructions, :jsonb, null: true
    add_column :block_languages, :root_css_classes, :string, array: true, :default => []

    change_column_null :block_languages, :model, true

    reversible do |change|
      change.up do
        BlockLanguage.all.each do |b|
          b.sidebars = b.model.fetch("sidebars", [])
          b.editor_blocks = b.model.fetch("editorBlocks", [])
          b.editor_components = b.model.fetch("editorComponents", [])
          b.local_generator_instructions = b.model.fetch("localGeneratorInstructions", { "type" => "manual" })
          b.root_css_classes = b.model.fetch("root_css_classes", [])

          b.save!
        end
      end
    end
  end
end
