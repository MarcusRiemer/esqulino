class MultilingualProject < ActiveRecord::Migration[6.0]
  # Ensure that a model class for this migration is available
  # https://railsguides.net/change-data-in-migrations-like-a-boss/
  class Project < ActiveRecord::Base
  end

  def change
    rename_column :projects, :name, :name_single
    rename_column :projects, :description, :description_single

    add_column :projects, :name, :hstore, null: false, default: {}
    add_column :projects, :description, :hstore, null: false, default: {}

    Project.all.each do |p|
      p.name = { 'de' => p.name_single }

      p.description = if p.description_single
                        { 'de' => p.description_single }
                      else
                        {}
                      end

      p.save!
    end
  end
end
