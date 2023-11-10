# Taken from: https://stackoverflow.com/questions/17150064/

namespace :db do
  desc 'Checks whether the configured database exists'
  task :exists do
    Rake::Task['environment'].invoke
    ActiveRecord::Base.connection
  rescue StandardError
    exit 1
  else
    exit 0
  end
end
