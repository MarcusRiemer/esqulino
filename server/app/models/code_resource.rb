class CodeResource < ApplicationRecord
  belongs_to :project
  
  validates :name, presence: true
  
  # The AST is a single root node or empty
  validates :ast, json_schema: 'NodeDescription', allow_nil: true
end
