# frozen_string_literal: true

# This project on a whole will have some fairly sophisticated default datasets that
# need to be updated possibly even more frequently than the actual code. The end-goal
# of this class is to provide a solution to keep the "stock" projects of BlattWerkzeug
# up to date as easily as possible without any interference in the user data. Any admin
# should be sure that updating the "stock" data of BlattWerkzeug will never, ever damage
# the projects of the users ad.
#
# But the way to achieve that vision is not so straight forward:
#
# * The fact that  some data is stored "outside" of the normal database (images, SQLite
#   databases) does not make the import/export process more pleasant. So a simple "just
#   do a SQL-dump and be happy"-approach is not something we can use. Therefore a custom
#   storage format that can hold more then a simple SQL-blob is required.
#
# * What makes things worse is that we have some quite sophisticated dependencies
#   between models. Using UUIDs as primary keys eliminates a lot of problems (as long as
#   they don't collide ... Heaven help us if they do ...) because we can assume that
#   every new ID we bring in with the "stock" data is probably unique.
#
# Data migrations as a whole seem to be a very application specific topic, at least I
# could not find a suitable general-purpose library for our specific use-case. So we do
# what every programmer loves: We bring out our own solution ...
#
# This class holds together the whole serialization and deserialization process.
# We basically piggy-back the `to_yaml`-representation of ActiveModel to have a
# robust (but very verbose) on-disk representation of our models.
class SeedManager
  #############################################
  # Projects
  #############################################

  # Writes all projects to their seed representation
  def store_all_projects
    Seed::ProjectSeed.store_all
  end

  # Loads all projects that are available as seeds
  def load_all_projects
    run_loading_operation do
      Seed::ProjectSeed.load_all
    end
  end

  # Loads a specific block language
  #
  # @param path_slug_or_id [string]
  #   The path, slug or the ID of the project to load.
  def load_project(path_slug_or_id)
    Seed::ProjectSeed.new(path_slug_or_id).start_load
  end

  # Stores a specific project with all of its dependencies
  #
  # @param project_slug_or_id [Project|string]
  #   Given projects will be used directly, strings will be matched against
  #   IDs or slugs of the existing projects.
  def store_project(project_slug_or_id)
    Seed::ProjectSeed.new(project_slug_or_id).start_store
  end

  #############################################
  # Block languages
  #############################################

  # Stores all block languages
  def store_all_block_languages
    Seed::BlockLanguageSeed.store_all
  end

  # Loads all block languages that are available as seeds
  def load_all_block_languages
    Seed::BlockLanguageSeed.load_all
  end

  # Stores a specific block language
  #
  # @param slug_or_id [string] The slug or the ID of the project to store.
  def store_block_language(block_language_slug_or_id)
    Seed::BlockLanguageSeed.new(block_language_slug_or_id).start_store
  end

  # Loads a specific block language
  #
  # @param path_slug_or_id [string]
  #   The path, slug or the ID of the block language to load.
  def load_block_language(path_slug_or_id)
    Seed::BlockLanguageSeed.new(path_slug_or_id).start_load
  end

  #############################################
  # Grammars
  #############################################

  # Stores all grammars
  def store_all_grammars
    Seed::GrammarSeed.store_all
  end

  # Loads all block languages that are available as seeds
  def load_all_grammars
    Seed::GrammarSeed.load_all
  end

  # Stores a specific block language
  #
  # @param slug_or_id [string] The slug or the ID of the project to store.
  def store_grammar(grammar_slug_or_id)
    Seed::GrammarSeed.new(grammar_slug_or_id).start_store
  end

  # Loads a grammar
  #
  # @param path_slug_or_id [string]
  #   The path, slug or the ID of the block language to load.
  def load_grammar(path_slug_or_id)
    Seed::GrammarSeed.new(path_slug_or_id).start_load
  end

  #############################################
  # News
  #############################################

  # Stores all news
  def store_all_news
    Seed::NewsSeed.store_all
  end

  # Loads all news that are available as seeds
  def load_all_news
    Seed::NewsSeed.load_all
  end

  #############################################
  # User
  #############################################

  # Stores all users
  def store_all_users
    Seed::UserSeed.store_all
  end

  # Loads all users that are available as users
  def load_all_users
    Seed::UserSeed.load_all
  end

  #############################################
  # Roles
  #############################################

  # Stores all users
  def store_all_roles
    Seed::RoleSeed.store_all
  end

  # Loads all roles that are available
  def load_all_roles
    Seed::RoleSeed.load_all
  end

  #############################################
  # User roles
  #############################################

  # Stores all users
  def store_all_user_roles
    Seed::UserRoleSeed.store_all
  end

  # Loads all roles that are available
  def load_all_user_roles
    Seed::UserRoleSeed.load_all
  end

  #############################################
  # Programming Languages
  #############################################

  def store_all_programming_languages
    Seed::ProgrammingLanguageSeed.store_all
  end

  def load_all_programming_languages
    Seed::ProgrammingLanguageSeed.load_all
  end

  private

  # While some callbacks are extremely relevant for the "normal" operation
  # of the application, they are annoying when effectively loading a
  # database dump: They may invoke the CLI-IDE (which takes time) or depend
  # on resources that are not yet loaded.
  #
  # This method is intended to be called with a block that selectively turns
  # off such callbacks.
  #
  # DO NOT CALL THIS METHOD FROM A RUNNING SERVER INSTANCE! Disabling callbacks
  # is a change to global state and although this method ensures to revert to
  # the previously defined callbacks, bad things will happen if a live request
  # is processed while the callbacks are skipped.
  def run_loading_operation
    callbacks_to_skip = [
      { model_class: CodeResource, name: :save, moment: :before, method: :before_save_compile },
      { model_class: CodeResource, name: :save, moment: :after,  method: :after_save_update_references }
    ]

    callbacks_to_skip.each do |h|
      h[:model_class].skip_callback(h[:name], h[:moment], h[:method])
    end

    yield
  ensure
    callbacks_to_skip.each do |h|
      h[:model_class].set_callback(h[:name], h[:moment], h[:method])
    end
  end

  # Singleton instance of the SeedManager
  def self.instance
    @@instance ||= SeedManager.new
  end

  # We probably don't want to output during testing, so this is configurable
  def puts(*args)
    return unless Rails.configuration.sqlino['seed']['output']

    super(args)
  end
end
