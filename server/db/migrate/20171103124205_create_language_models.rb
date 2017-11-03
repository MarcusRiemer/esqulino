class CreateLanguageModels < ActiveRecord::Migration[5.1]
  def change
    create_table :language_models, id: false do |t|
      t.uuid :id
      t.string :name

      t.timestamps
    end
  end
end
