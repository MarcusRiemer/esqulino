class CreateProgrammingLanguages < ActiveRecord::Migration[5.1]
  def change
    create_table :programming_languages, id: :text do |t|
      t.string :name, null: false
    end

    add_reference :code_resources, :programming_language, index: true, type: :text, null: false
    add_foreign_key :code_resources, :programming_languages
  end
end
