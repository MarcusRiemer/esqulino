# frozen_string_literal: true

# Validates all projects.
#
# @return [Array<ApplicationRecord>] All invalid models
def verify_all_projects
  invalid = []

  Project.all.each do |proj|
    invalid.concat(verify_project(proj))
  end

  invalid
end

# Verifies all resources of a project that may be invalid
#
# @param proj [Project] The project to use as entry point for validation
# @return [Array<ApplicationRecord>] All invalid resources
def verify_project(proj)
  invalid_models = []

  # The project itself might be invalid
  invalid_models << proj unless proj.validate

  proj.code_resources.each do |c|
    invalid_models << c unless c.validate
  end

  invalid_models
end

# Returns only grammars that did not validate
#
# @return [Array<ApplicationRecord>] All invalid grammars
def select_all_invalid_grammars
  select_invalid Grammar.all
end

# Returns only block languages that did not validate
#
# @return [Array<ApplicationRecord>] All invalid block languages
def select_all_invalid_block_languages
  select_invalid BlockLanguage.all
end

# Returns only models that did not validate
#
# @return [Array<ApplicationRecord>] All invalid models
def select_invalid(records)
  records.reject(&:validate)
end

# Prints all models that have been identified as invalid
def output_invalid_models(invalid_models)
  invalid_models.each do |m|
    puts "#### #{m.readable_identification} ####"
    puts m.errors.full_messages
    puts
  end

  return unless invalid_models.any?

  puts "Summary of #{invalid_models.count} invalid block languages:"
  invalid_models.each do |m|
    puts m.readable_identification
  end
end

namespace :blattwerkzeug do
  namespace :project do
    desc 'Validate integrity of a single project'
    task :validate, [:project_id] => :environment do |_t, args|
      output_invalid_models verify_project(Project.find_by_slug_or_id!(args[:project_id]))
    end

    desc 'Validate integrity of all projects'
    task validate_all: :environment do |_t, _args|
      output_invalid_models verify_all_projects
    end
  end

  namespace :grammar do
    desc 'Validate integrity of all grammars'
    task validate_all: :environment do |_t, _args|
      output_invalid_models select_all_invalid_grammars
    end
  end

  namespace :block_language do
    desc 'Validate integrity of all block_languages'
    task validate_all: :environment do |_t, _args|
      output_invalid_models select_all_invalid_block_languages
    end
  end
end
