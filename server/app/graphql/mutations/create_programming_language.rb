# Used to create all relevant records that define a programming language
# and add them to the given project.
class Mutations::CreateProgrammingLanguage < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :language_name, String, required: true
  argument :runtime_language_id, String, required: true
  argument :create_initial_code_resource, Boolean, required: false

  field :grammar, Types::GrammarType, null: false
  field :grammar_code_resource, Types::CodeResourceType, null: false
  field :initial_code_resource, Types::CodeResourceType, null: true
  field :used_block_language, Types::ProjectUsesBlockLanguageType, null: false

  def resolve(
        project_id:,
        language_name:,
        runtime_language_id:,
        create_initial_code_resource: true
      )
    p = Project.find_by(id: project_id)

    # The following models must be created all together or not at all
    ActiveRecord::Base.transaction do
      # Ensure that the project uses the meta block language
      usage = ProjectUsesBlockLanguage.where(
        project_id: project_id,
        block_language_id: BlockLanguage.meta_grammar_id
      ).first_or_create!

      # Create a code resource for the grammar
      grammar_code_resource = CodeResource.create!(
        name: "Grammar: " + language_name,
        project: p,
        programming_language_id: "meta-grammar",
        block_language_id: BlockLanguage.meta_grammar_id,
        ast: {
          "name": "grammar",
              "language": "MetaGrammar",
              "properties": {
                              "name": "a"
                            },
              "children": {
                            "root": [],
                           "nodes": []
                          }
        }
      )

      # Create a backing grammar. This touches the database because
      # we need an ID for the CLI.
      grammar = Grammar.create!(
        name: language_name,
        generated_from: grammar_code_resource,
        programming_language_id: "meta-grammar",
      )
      grammar.regenerate_from_code_resource!
      grammar.save!

      # Create a backing block language. This agaitn touches the
      # database because we need an ID for the CLI.
      block_language = BlockLanguage.create!(
        name: language_name,
        grammar: grammar,
        default_programming_language_id: runtime_language_id,
        local_generator_instructions: {
          "type": "manual"
        }
      )
      block_language.regenerate_from_grammar!
      block_language.save!

      # Ensure that the project may use the newly added block language
      used_block_language = p.project_uses_block_languages
                              .create!(block_language: block_language)

      # Possibly create an initial code resource to play around with
      initial_code_resource =
        if (create_initial_code_resource)
          CodeResource.create!(
            name: "Initial: " + language_name,
            project: p,
            programming_language_id: runtime_language_id,
            block_language_id: block_language.id
          )
        end

      # Don't return out of the transaction-block, this would
      # leave a lingering transaction
      next ({
        grammar: grammar,
        grammar_code_resource: grammar_code_resource,
        initial_code_resource: initial_code_resource,
        used_block_language: used_block_language,
      })
    end
  end
end
