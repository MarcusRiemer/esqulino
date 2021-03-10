# Used to create all relevant records that define a programming language
# and add them to the given project.
class Mutations::CreateProgrammingLanguage < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :language_name, String, required: true
  argument :runtime_language_id, String, required: true

  field :grammar, Types::GrammarType, null: false
  field :grammar_code_resource, Types::CodeResourceType, null: false

  def resolve(project_id:, language_name:, runtime_language_id:)
    p = Project.find_by(id: project_id)

    # Ensure that the project uses the meta block language
    usage = ProjectUsesBlockLanguage.where(
      project_id: project_id,
      block_language_id: BlockLanguage.meta_grammar_id
    ).first_or_create!

    # Create a code resource for the grammar
    grammar_code_resource = CodeResource.create!(
      name: language_name,
      project: p,
      programming_language_id: "meta-grammar",
      block_language_id: BlockLanguage.meta_grammar_id
    )

    # Create a backing grammar
    grammar = Grammar.create!(
      name: language_name,
      generated_from: grammar_code_resource,
      programming_language_id: "meta-grammar",
    )

    # Create a backing block language
    block_language = BlockLanguage.create!(
      name: language_name,
      grammar: grammar,
      default_programming_language_id: runtime_language_id,
      local_generator_instructions: {
        "type": "manual"
      }
    )

    # Ensure that the project may use the newly added block language
    p.project_uses_block_languages.create!(block_language: block_language)

    return {
      grammar: grammar,
      grammar_code_resource: grammar_code_resource
    }
  end
end
