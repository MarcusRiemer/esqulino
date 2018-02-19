namespace :blattwerkzeug do
  namespace :project do
    desc 'Load a project from it on-disk representation'
    task :load, [:project_id] => :environment do |t, args|
      puts "Loading project #{args[:project_id]} ..."
    end

    desc 'Serialize a project to its on-disk representation'
    task :store, [:project_id] => :environment do |t, args|
      puts "Storing project #{args[:project_id]} ..."
    end
    
  end
end
