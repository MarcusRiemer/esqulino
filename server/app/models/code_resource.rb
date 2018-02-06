# A source code snippet in any language that can be expressed by using
# a compatible JSON-syntaxtree.
#
# There are more specific types of resources (at the moment: pages and
# queries) that are subclasses of this general resource and provide
# specific additional functionality.
class CodeResource < ApplicationRecord
  # Each resource belongs to a single project ...
  belongs_to :project
  # ... uses exactly one block language ...
  belongs_to :block_language
  # ... and compiles to exactly one programming language.
  belongs_to :programming_language

  # Name may not be empty
  validates :name, presence: true
  # The AST is a single root node or empty
  validates :ast, json_schema: 'NodeDescription', allow_nil: true

  # Takes the current syntaxtree and asks the IDE service for the
  # compiled representation.
  #
  # @raise [IdeServiceError] If anything goes wrong during compilation.
  def emit_ast!
    IdeService.instance.emit_code(self.ast, self.programming_language_id)
  end

  
end
