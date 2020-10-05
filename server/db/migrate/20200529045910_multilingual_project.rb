class MultilingualProject < ActiveRecord::Migration[6.0]
  # Ensure that a model class for this migration is available
  # https://railsguides.net/change-data-in-migrations-like-a-boss/
  class Project < ActiveRecord::Base
  end

  def change
    rename_column :projects, :name, :name_single
    rename_column :projects, :description, :description_single

    add_column :projects, :name, :hstore, null: false, :default => Hash.new
    add_column :projects, :description, :hstore, null: false, :default => Hash.new

    Project.all.each do |p|
      p.name = { "de" => p.name_single }

      if p.description_single
        p.description = { "de" => p.description_single }
      else
        p.description = {}
      end

      p.save!
    end
  end
end
