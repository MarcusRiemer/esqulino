# A project is a group of resources that logically belong together.
# Currently every project is assumed to be somewhat web-centric
# (using databases and HTML), but this is not set in stone.
class Project < ApplicationRecord
  has_many :project_sources, dependent: :destroy
  has_many :code_resources

  validates :slug, uniqueness: true
  # Name may not be empty
  validates :name, presence: true
  # Name may not be empty
  validates :slug, presence: true
  # A project with all associated resources that are required for
  # immediate display on the client.
  scope :full, -> { includes(:project_sources, :code_resources) }

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_return = super
    
    to_return['schema'] = []
    to_return['apiVersion'] = '4'
    to_return['activeDatabase'] = "default"
    to_return['codeResources'] = self.code_resources.map(&:to_full_api_response)
    to_return['sources'] = self.project_sources.map(&:serializable_hash)
    
    to_return
  end
  
  def to_param
    "#{slug}"
  end
end
