#!/usr/bin/env ruby

require 'optparse'
require 'io/console' # To read a password without echoing it

require './project.rb'
require './error.rb'
require './version.rb'

require './migrate/migrate.rb'

# Some UNIX terminal colours
# TODO: Make this cross platform
class String
  def black;          "\033[30m#{self}\033[0m" end
  def red;            "\033[31m#{self}\033[0m" end
  def green;          "\033[32m#{self}\033[0m" end
  def yellow;         "\033[33m#{self}\033[0m" end
  def blue;           "\033[34m#{self}\033[0m" end
  def magenta;        "\033[35m#{self}\033[0m" end
  def cyan;           "\033[36m#{self}\033[0m" end
  def gray;           "\033[37m#{self}\033[0m" end
end

# Base class for errors that are specific for the CLI
class CliError < StandardError
end

# Wraps all possible esqulino commandline operations
class EsqulinoCli
  def initialize()
    @indent_level = 0
    
    @parser = OptionParser.new do |opts|
      opts.banner = "Usage: esqulino-cli.rb [options]"

      # Help for the user
      opts.on("-h", "--help", "Prints this help") do
        puts opts
        exit
      end

      opts.on("--check-version", "Checks whether this installation is up2date") do
        version = nil

        self.print_progress_line "Version check - Fetching remote version" do
          version = check_against_master_repo()
        end

        if not version.nil? then
          self.print_indent do
            self.status "Local Version:"
            self.print_indent do
              self.status "Rev : #{version[:local][:hash]}"
              self.status "Date: #{version[:local][:date].httpdate}"
            end
          end
          self.print_indent do
            self.status "Remote Version:"
            self.print_indent do
              self.status "Rev : #{version[:remote][:hash]}"
              self.status "Date: #{version[:remote][:date].httpdate}"
            end
          end

          self.status "Most recent: #{version[:newest]}" unless version[:newest] == :same
        end
      end

      # Suppressing status output
      opts.on("-q", "--quiet", "Silences status output") do
        @quiet = true
      end

      opts.on("-d", "--data-dir PATH", "The data directory for this esqulino instance") do |path|
        @data_dir = path
        raise EsqulinoError.new("Data directory #{path} does not exist") unless Dir.exists? path
      end

      # Setting a project path is required for all project-specific
      # operations.
      opts.on("-p", "--project-path PATH", "Specifies the project to operate on") do |path|
        @project = Project.new(path, true)
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

        status_project(@project, "Created page \"#{page.name}\"")
      end

      # Sets the password for a certain project
      opts.on("--password USER", "(Re)Set the password for a user") do |user,pass|       
        # Ask the user for a password until he provides one
        while (pass.nil? or pass.empty?) do
          print "Enter new password: "
          pass = STDIN.noecho(&:gets).strip
          puts ""
        end
        
        projects.each do |p|
          self.print_progress_line (self.fmt_project p, "Setting password for user \"#{user}\"") do
            p.set_password user, pass
            p.save_description
          end
        end
      end

      # Migrates resources to newer API versions
      opts.on("--migrate", "Updates resources to fit a newer API specification") do
        projects.each do |p|
          migrate_project(self, p, ESQULINO_API_VERSION)
        end
      end

      # Create a clone of a project
      opts.on("--clone NEW_ID", "Clones the given project and makes it available under NEW_ID") do |id|
        print_progress_line (fmt_project project, "Cloning to \"#{id}\"") do
          project.clone id
        end
      end
    end
  end

  # The user may specify one or multiple projects, this methods helps
  # iterating over all specified projects no matter how they are specified.
  #
  # @return A Project enumerable
  def projects
    if @project.nil? then
      enumerate_projects File.join(@data_dir, "projects"), true, false
    else
      [@project]
    end
  end

  # Allows access to a single single project
  def project
    raise CliError.new("Single project requested, multiple available") unless @data_dir.nil?
    raise CliError.new("Single project requested, none available") if @project.nil?

    @project
  end

  # Parses and executes the commandline
  def parse!(argv)
    @parser.parse! argv
  end

  # Format a status message for a project
  def fmt_project(project, to_output)
    "Project \"#{project.id}\": #{to_output}"
  end

  # Format a status message for a query
  def fmt_query(query, to_output)
    "Query \"#{query.name}\": #{to_output}"
  end

  # Format a status message for a page
  def fmt_page(page, to_output)
    "Page \"#{page.name}\": #{to_output}"
  end

  # Prints a status message in the context of a project
  def status_project(project, to_output)
    status fmt_project(project, to_output)
  end

  # Prints a status message in the context of a query
  def status_query(query, to_output)
    status fmt_query(query, to_output)
  end

  # Prints a status message in the context of a page
  def status_page(page, to_output)
    status fmt_page(page, to_output)
  end
  
  # Prints a status message
  def status(to_output, newline = true)
    if not @quiet
      indented_output = "#{' ' * @indent_level}#{to_output}"
      if newline then
        puts indented_output
      else
        print indented_output
        STDOUT.flush
      end
    end
  end

  # Print something indented
  def print_indent
    begin
      self.indent!
      yield
    ensure
      self.dedent!
    end
  end

  # Print something that (hopefully) does not require any additional
  # output.
  def print_progress_line(message, done = "DONE", failed = "FAIL")
    begin
      yield
      self.status_progress_prefix(done.green, message)
    rescue StandardError => e
      self.status_progress_prefix(failed.red, message)
      self.print_indent do
        self.status e.to_s
        e.backtrace.each {|l| self.status l }
      end
    end
  end

  def status_progress_prefix(prefix, message)
    status "[#{prefix}] #{message}"
  end

  # Increases indentation level
  def indent!
    @indent_level += 1
  end

  # Decreases indentation level, but never past 0
  def dedent!
    @indent_level -= 1
    raise StandardError.new("Dedented past 0") if @indent_level < 0
  end
end

# Don't run if required from somewhere
if __FILE__ == $0
  begin
    cli = EsqulinoCli.new
    cli.parse! ARGV
  rescue EsqulinoError => e
    puts "#{e.class.name.red}: #{e}"
  rescue CliError, OptionParser::MissingArgument => e
    puts "#{e.class.name.yellow}: #{e}"
  end
end

