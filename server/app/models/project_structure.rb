class ProjectStructure < ApplicationRecord
  self.table_name = "projects"
  has_many :project_sources, class_name: "ProjectSource"

  before_create :set_slug

  validates :slug, uniqueness: true, on: :create

  def to_param
    "#{slug}"
  end

  def self.find(input)
    find_by_slug(input)
  end

  private
  def set_slug
    self.slug = name.parameterize
  end
end
