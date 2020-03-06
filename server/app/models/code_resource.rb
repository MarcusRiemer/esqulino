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

  # May be the basis for generated grammars
  has_many :grammars, foreign_key: 'generated_from_id', class_name: 'Grammar'

  # Name may not be empty
  validates :name, presence: true
  # The AST is a single root node or empty
  validates :ast, json_schema: 'NodeDescription', allow_nil: true

  # The associated block language must be permitted by the parent project.
  # If the project does not reference the block language that this resource
  # is referencing the reference is not allowed.
  validate do
    if (self.block_language and self.project) and not self.project.block_languages.include? self.block_language then
      errors.add(:block_language, "not allowed by project")
    end
  end

  # Okay, this is tricky: We somehow need to keep the compiled version
  # of the syntaxtree in sync with the "actual" syntaxtree. So we want
  # to have some action that checks whether the syntaxtree has been
  # updated and then update the compiled version.
  #
  # The main problem is that the compilation requires interaction with
  # an external process. This is a) slow and b) error prone. So my
  # gut says that its probably good to be explicit about this (possibly)
  # fragile operation. And this leads to the actual question: Where
  # should the "sync" code go?
  #
  # And on top of that this dependency makes testing quite hard. After
  # all there are possibly quite a few code resources that will be saved
  # during testing, even if we don't care about the details of compilation.
  # The IdeService should not come in to play for each and every of this
  # testfiles because a) it slows down tests and b) it makes "real"
  # syntaxtrees a requirement for trees during testing.
  #
  # The following options have been considered:
  #
  # Option 1) In the model, immediatly after setting the ast. This was
  # proposed on SO (https://stackoverflow.com/questions/48623312/) but
  # I don't really fancy the idea of running the compiler on every
  # assignment and making a "simple" assignment possibly raising
  # exceptions.
  #
  # Option 2) In the model, but only on save operations using a callback.
  # This still means the code resource has a *huge* dependency on an
  # external process, but at least its encapsulated when touching the
  # other *huge* dependency (the database).
  #
  # Option 3) In every controller that somehow touches this model. This
  # seems to go against the core idea of "fat models and skinny controllers",
  # so I will leave that out for the moment.
  before_save do
    if self.ast_changed?
      self.compiled = emit_ast!
    end
  end

  # Takes the current syntaxtree and asks the IDE service for the
  # compiled representation.
  #
  # @param ide_service [IdeService] A connection to the ide service
  #        that may be used to generate the source code.
  # @param programming_language_id [string] The id of the language
  #        that should be used for code generation. May be `nil`
  #        to roll with the language that is defined on the model.
  #
  # @raise [IdeServiceError] If anything goes wrong during compilation.
  def emit_ast!(ide_service = IdeService.instance, programming_language_id: nil)
    programming_language_id ||= self.programming_language_id
    ide_service.emit_code(self.ast, programming_language_id)
  end

  # All records that are immediatly depending on this code resource. This
  # is of interest when e.g. saving this resource, as it may require updates
  # to these objects.
  def immediate_dependants
    self.grammars
  end

  # Regenerates other resources that depend on this code resource.
  #
  # @return [Array<Grammar|CodeResource>] All dependants that have been regenerated
  def regenerate_immediate_dependants!
    changed_dependants = []

    self.immediate_dependants.each do |i|
      i.regenerate_from_code_resource!
      i.save!
    end
  end

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_json_api_response.slice("name", "id", "ast", "createdAt", "updatedAt", "blockLanguageId", "programmingLanguageId")
  end
end
