# A project is a group of resources that logically belong together.
# Currently every project is assumed to be somewhat web-centric
# (using databases and HTML), but this is not set in stone.
class Project < ApplicationRecord

  has_many :project_sources, :dependent => :destroy
  has_many :code_resources
  has_many :project_uses_block_languages
  has_many :block_languages, :through => :project_uses_block_languages

  validates :slug, uniqueness: true
  # Name may not be empty
  validates :name, presence: true
  # Slug may not be empty
  validates :slug, presence: true

  # Projects that are publicly available
  scope :only_public, -> { where(public: true) }
  # A project with all associated resources that are required for
  # immediate display on the client.
  scope :full, -> { includes(:project_sources, :code_resources, :block_languages) }
  # A project with all associated resources that are used by **only** this
  # project and no other project.
  scope :with_exclusive, -> { includes(:project_sources, :code_resources, :block_languages) }

  # Packs the project and all of its dependencies into a big blob of data. This blob
  # is meant to be fully self contained as we expect projects to be fairly small in the
  # average case. We may need to rethink this approach if individual projects turn out
  # to be too big.
  def to_full_api_response
    to_return = to_json_api_response
    
    to_return['schema'] = []
    to_return['apiVersion'] = '4'
    to_return['activeDatabase'] = "default"
    to_return['codeResources'] = self.code_resources.map(&:to_full_api_response)
    to_return['sources'] = self.project_sources.map(&:serializable_hash)
    to_return['blockLanguages'] = self.block_languages.map(&:to_full_api_response)

    to_return
  end

  # Hands out just enough data about this project to allow a nice listing of available
  # projects in the client.
  def to_list_api_response
    to_json_api_response
  end

  # The folder that should contain all assets that are part of this directory.
  def data_directory_path
    File.join(Rails.application.config.sqlino[:projects_dir], id)
  end

  # Retrieves the path to a SQLite database with a specific ID.
  def sqlite_file_path(db_id)
    File.join(data_directory_path, "databases", "#{db_id}.sqlite")
  end

  # TODO: This shouldn't be part of this class but possibly of a helper?
  #
  # Determines whether the given name of the table is part of the given database?
  #
  # @param table_name [string] The name of the table in question
  # @param database_id [string] The ID of the schema to search in
  # @return [Boolean] True if the given table_name is part of the database_schema
  def has_table(table_name, database_id = nil)
    database_id = database_id || "default"

    schema = database_describe_schema(self.sqlite_file_path database_id)

    return !schema(database_id).detect{|table| table.name.eql? table_name}.nil?
  end
  
  # Returns a nicely readable representation of id, slug and name
  def readable_identification
    "\"#{name}\" (#{slug}, #{id})"
  end
end
