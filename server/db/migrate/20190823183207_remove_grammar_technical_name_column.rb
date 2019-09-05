class RemoveGrammarTechnicalNameColumn < ActiveRecord::Migration[5.2]
  def change
    remove_column :grammars, :technical_name
  end
end
