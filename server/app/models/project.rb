# A project is a group of resources that logically belong together.
# Currently every project is assumed to be somewhat web-centric
# (using databases and HTML), but this is not set in stone.
class Project < ApplicationRecord
  has_many :project_sources, dependent: :destroy
  has_many :code_resources

  validates :slug, uniqueness: true

  # A project with all associated resources that are required for
  # immediate display on the client.
  scope :full, -> { includes(:project_sources, :code_resources) }
  
  def to_param
    "#{slug}"
  end
end
