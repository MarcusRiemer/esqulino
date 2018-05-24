require 'fileutils'

# SeedManager is only available after the Rails stuff has been loaded
# via the :environment dependency. So we delay the instatiation of the
# seed manager.
def m
  SeedManager.instance
end

# Actual definitions of rake tasks
namespace :blattwerkzeug do
  namespace :file_storage do
    task :delete_all => :environment do |t, args|
      data_dir = Rails.configuration.sqlino["data_dir"]
      data_project_glob = File.join data_dir, "projects", '*'
      puts "Deleting project data at \"#{data_project_glob}\""
      FileUtils.rm_rf(Dir.glob(data_project_glob))
    end
  end
  
  namespace :project do
    desc '(Re)load all projects from their seed representation'
    task :load_all => :environment do |t, args|
      m.load_all_projects
    end

    desc 'Load a project from its seed representation'
    task :load, [:project_id] => :environment do |t, args|
      m.load_project args[:project_id]
    end

    desc 'Serialize all projects to their seed representation'
    task :store_all => :environment do |t, args|
      m.store_all_projects
    end

    desc 'Serialize a project to its seed representation'
    task :store, [:project_id] => :environment do |t, args|
      m.store_project(args[:project_id])
    end
  end

  namespace :programming_language do
    desc '(Re)load all block languages and grammars from their seed representation'
    task :load_all => :environment do |t, args|
      m.load_all_grammars
      m.load_all_block_languages
    end

    desc 'Serialize all block languages and grammars to their seed representation'
    task :store_all => :environment do |t, args|
      m.store_all_grammars
      m.store_all_block_languages
    end

    desc 'Load a block language from it on-disk representation'
    task :load, [:block_language_id] => :environment do |t, args|
      m.load_block_language(args[:block_language_id])
    end

    desc 'Serialize a block language to its seed representation'
    task :store, [:block_language_id] => :environment do |t, args|
      m.store_block_language(args[:block_language_id])
    end
  end
end
