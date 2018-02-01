class ProjectStructure < ApplicationRecord
  self.table_name = "projects"
  has_many :project_sources, class_name: "ProjectSource"

  validates :slug, uniqueness: true
  
  def to_param
    "#{slug}"
  end

  def self.find(input)
    find_by_slug(input)
  end

end
