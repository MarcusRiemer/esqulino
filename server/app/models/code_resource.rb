class CodeResource < ApplicationRecord
  belongs_to :project, class_name: "ProjectStructure"
  
  validates :name, presence: true
  belongs_to :project_structure
  # The AST is a single root node or empty
  validates :ast, json_schema: 'NodeDescription', allow_nil: true
end
