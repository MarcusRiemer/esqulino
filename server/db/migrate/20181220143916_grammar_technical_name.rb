class GrammarTechnicalName < ActiveRecord::Migration[5.2]
  def up
    add_column :grammars, :technical_name, :string
    Grammar.reset_column_information

    Grammar.all.each do |g|
      g.technical_name = g.name
      g.save!
    end
  end

  def down
    remove_column :grammars, :technical_name
  end
end
