class ProjectStructure < ApplicationRecord
  self.table_name = "projects"
  has_many :project_sources, class_name: "ProjectSource", foreign_key: :project_id
end
