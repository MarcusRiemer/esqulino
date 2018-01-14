class ProjectSource < ApplicationRecord
  belongs_to :project_structure, class_name: "ProjectStructure", optional: true
end
