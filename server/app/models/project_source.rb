class ProjectSource < ApplicationRecord
  belongs_to :project_structure, optional: true
end
