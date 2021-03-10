# Used to create all relevant records that define a programming language
# and add them to the given project.
class Mutations::CreateProgrammingLanguage < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :language_name, String, required: true

  field :grammar_id, ID, null: false
  field :grammar_code_resource_id, ID, null: false

  def resolve(project_id:, language_name:)
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
    )

    # Create a backing grammar
    grammar



    return { id: p.id }
  end
end
