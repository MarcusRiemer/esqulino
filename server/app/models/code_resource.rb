class CodeResource < ApplicationRecord
  validates :name, presence: true
  belongs_to :project_structure
  # The AST is a single root node or empty
  validates :ast, json_schema: 'NodeDescription', allow_nil: true
end
