class ProjectStructure < ApplicationRecord
  self.table_name = "projects"
  has_many :project_sources, foreign_key: :projects_id
end
