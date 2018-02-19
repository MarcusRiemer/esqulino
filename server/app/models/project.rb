# A project is a group of resources that logically belong together.
# Currently every project is assumed to be somewhat web-centric
# (using databases and HTML), but this is not set in stone.
class Project < ApplicationRecord

  has_many :project_sources, dependent: :destroy
  has_many :code_resources
  has_and_belongs_to_many :block_languages

  validates :slug, uniqueness: true
  # Name may not be empty
  validates :name, presence: true
  # Slug may not be empty
  validates :slug, presence: true
  # A project with all associated resources that are required for
  # immediate display on the client.
  scope :full, -> { includes(:project_sources, :code_resources, :block_languages) }
  # scope to filter records which are only public
  scope :only_public, -> { where(public: true) }
  # TODO: need to know, do we really need this?
  # Filter records if preview is null
  # Where.not fully qualify for the column name with the table name, so will
  # continue working with complex relations and used as (NOT IN)
  # default_scope { where.not(preview: nil) }
  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_list_api_response

    to_return = to_json_api_response
    
    to_return['schema'] = []
    to_return['apiVersion'] = '4'
    to_return['activeDatabase'] = "default"
    to_return['codeResources'] = self.code_resources.map(&:to_full_api_response)
    to_return['sources'] = self.project_sources.map(&:serializable_hash)
    to_return['blockLanguages'] = self.block_languages.map(&:to_full_api_response)

    to_return
  end

  def to_list_api_response
    to_json_api_response
  end
  # Rails uses this method to dynamically determine the name of the attribute
  # that should be used when searching for this entity. As projects are identified
  # via their slugs in visible places (e.g. URLs) we tell rails to search for slugs.
  def to_param
    slug
  end
end
