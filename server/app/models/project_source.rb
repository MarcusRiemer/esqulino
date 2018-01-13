class ProjectSource < ApplicationRecord
  belongs_to :project_structure, foreign_key: :projects_id
end
