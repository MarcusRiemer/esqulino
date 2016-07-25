#!/usr/bin/env ruby

require 'optparse'

require './project.rb'
require './error.rb'

# Wraps all possible esqulino commandline operations
class EsqulinoCli
  def initialize()
    @parser = OptionParser.new do |opts|
      opts.banner = "Usage: esqulino-cli.rb [options]"

      # Help for the user
      opts.on("-h", "--help", "Prints this help") do
        puts opts
        exit
      end

      # Suppressing status output
      opts.on("-q", "--quiet", "Silences status output") do
        @quiet = true
      end


      # Setting a project path is required for all project-specific
      # operations.
      opts.on("-p", "--project-path PATH", "Specifies the project to operate on") do |path|
        @project = Project.new path
        raise UnknownProjectError.new(path) unless @project.exists?
      end

      # Adds a new page to the specified project
      opts.on("--add-page NAME", "Adds a new page") do |name|
        raise EsqulinoError.new "Duplicate name" if @project.page_by_name? name
        
        model = {
          "name" => name,
          "rows" => [],
          "referencedQueries" => []
        }

        page = Page.new(@project, nil, model)
        page.save_model

        project_status "Created page \"#{page.name}\""
      end
    end
  end

  # Parses and executes the commandline
  def parse!(argv)
    @parser.parse! argv
  end

  # Prints a status message in the context of a project
  def project_status(to_output)
    status "Project \"#{@project.id}\": " + to_output
  end
  
  # Prints a status message
  def status(to_output)
    puts to_output unless @quiet
  end
end

# Don't run if required from somewhere
if __FILE__ == $0
  begin
    cli = EsqulinoCli.new
    cli.parse! ARGV
  rescue EsqulinoError => e
    puts "\e[31m#{e.class.name}\e[0m: #{e}"
  end
end

