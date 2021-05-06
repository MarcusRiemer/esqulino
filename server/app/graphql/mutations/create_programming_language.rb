# Used to create all relevant records that define a programming language
# and add them to the given project.
class Mutations::CreateProgrammingLanguage < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :language_display_name, String, required: true
  argument :language_technical_name, String, required: false
  argument :runtime_language_id, String, required: true

  argument :create_initial_code_resource, Boolean, required: false,
           description: "Create an empty code resource with the new language?"
  argument :create_structure_and_syntax_grammar, Boolean, required: false,
           description: "Split the grammar into two files?"
  argument :create_meta_block_language, Boolean, required: false,
           description: "Create a block language resource for the block language"

  field :structure_grammar, Types::GrammarType, null: false
  field :structure_grammar_code_resource, Types::CodeResourceType, null: false
  field :syntax_grammar, Types::GrammarType, null: false
  field :syntax_grammar_code_resource, Types::CodeResourceType, null: false
  field :initial_code_resource, Types::CodeResourceType, null: true
  field :used_block_language, Types::ProjectUsesBlockLanguageType, null: false

  DEFAULT_ROOT_CSS_CLASSES = ["activate-block-outline", "activate-keyword"]

  def resolve(
        project_id:,
        language_display_name:,
        language_technical_name: nil,
        runtime_language_id:,
        create_initial_code_resource: false,
        create_structure_and_syntax_grammar: false,
        create_meta_block_language: false
      )
    p = Project.find_by(id: project_id)

    # Use display name as a fallback if the user has not provided a technical name
    if language_technical_name.blank?
      language_technical_name = language_display_name
    end

    # The following models must be created all together or not at all
    ActiveRecord::Base.transaction do
      # Ensure that the project uses the meta grammar block language
      ProjectUsesBlockLanguage.where(
        project_id: project_id,
        block_language_id: BlockLanguage.meta_grammar_id
      ).first_or_create!

      # Create a code resource for the structural grammar
      structure_grammar_code_resource = CodeResource.create!(
        name: "Grammar: " + language_display_name,
        project: p,
        programming_language_id: "meta-grammar",
        block_language_id: BlockLanguage.meta_grammar_id,
        ast: ast_structure_grammar(language_technical_name)
      )

      # Create a backing grammar. This touches the database because
      # we need an ID for the CLI.
      structure_grammar = Grammar.create!(
        name: language_display_name,
        generated_from: structure_grammar_code_resource,
        programming_language_id: "meta-grammar",
      )
      structure_grammar.regenerate_from_code_resource!
      structure_grammar.save!

      # Possibly create a syntax grammar to play around with
      syntax_grammar = nil
      syntax_grammar_code_resource = nil
      if (create_structure_and_syntax_grammar)
        syntax_grammar_code_resource = CodeResource.create!(
          name: "Syntax: " + language_display_name,
          project: p,
          programming_language_id: "meta-grammar",
          block_language_id: BlockLanguage.meta_grammar_id,
          ast: ast_syntax_grammar(language_technical_name, structure_grammar.id)
        )

        syntax_grammar = Grammar.create!(
          name: language_display_name,
          generated_from: syntax_grammar_code_resource,
          programming_language_id: "meta-grammar",
        )
        syntax_grammar.regenerate_from_code_resource!
        syntax_grammar.save!
      end

      grammar_for_block_language = syntax_grammar || structure_grammar

      # Possibly create a meta code resource to define details of the block language
      meta_block_language_code_resource = nil
      if create_meta_block_language
        # Ensure that the project uses the meta block language block language
        ProjectUsesBlockLanguage.where(
          project_id: project_id,
          block_language_id: BlockLanguage.meta_block_language_id
        ).first_or_create!

        meta_block_language_code_resource = CodeResource.create!(
          name: "Blocks: " + language_display_name,
          project: p,
          programming_language_id: "generic",
          block_language_id: BlockLanguage.meta_block_language_id,
          ast: ast_meta_block_language()
        )
      end

      # Create a backing block language. This again touches the
      # database because we need an ID for the CLI.
      block_language = BlockLanguage.create!(
        name: language_display_name,
        grammar: grammar_for_block_language,
        default_programming_language_id: runtime_language_id,
        local_generator_instructions: {
          "type": "manual"
        },
        generated_from: meta_block_language_code_resource,
        root_css_classes: DEFAULT_ROOT_CSS_CLASSES
      )

      block_language.regenerate_from_grammar!(IdeService.guaranteed_instance)
      block_language.regenerate_from_code_resource!(IdeService.guaranteed_instance)
      block_language.save!

      # Ensure that the project may use the newly added block language
      used_block_language = p.project_uses_block_languages
                              .create!(block_language: block_language)

      # Possibly create an initial code resource to play around with
      initial_code_resource =
        if (create_initial_code_resource)
          CodeResource.create!(
            name: "Initial: " + language_display_name,
            project: p,
            programming_language_id: runtime_language_id,
            block_language_id: block_language.id
          )
        end

      # Don't return out of the transaction-block, this would
      # leave a lingering transaction
      next ({
              structure_grammar: structure_grammar,
              structure_grammar_code_resource: structure_grammar_code_resource,
              syntax_grammar: syntax_grammar,
              syntax_grammar_code_resource: syntax_grammar_code_resource,
              initial_code_resource: initial_code_resource,
              used_block_language: used_block_language,
            })
    end
  end

  # The AST that defines an empty structural grammar with a specific technical name.
  def ast_structure_grammar(language_technical_name)
    {
      "name" => "grammar",
      "language" => "MetaGrammar",
      "properties" => {
        "name" => language_technical_name
      },
      "children" => {
        "root" => [],
        "nodes" => []
      }
    }
  end

  # The AST that defines an empty syntax grammar with a specific technical name
  # which visualizes the given grammar.
  def ast_syntax_grammar(language_technical_name, structure_grammar_id)
    {
      "name" => "grammar",
      "language" => "MetaGrammar",
      "properties" => {
        "name" => language_technical_name
      },
      "children" => {
        "visualizes" => [
          {
            "name" => "grammarVisualizes",
            "language" => "MetaGrammar",
            "children" => {
              "includes" => [
                {
                  "name" => "grammarRef",
                  "language" => "MetaGrammar",
                  "properties" => {
                    "grammarId" => structure_grammar_id
                  }
                }
              ]
            }
          }
        ]
      }
    }
  end

  def ast_meta_block_language()
    {
      "name" => "Document",
      "language" => "MetaBlockLang",
      "children" => {
        "RootCssClasses" => DEFAULT_ROOT_CSS_CLASSES.map do |n|
          {
            "name" => "CssClass",
            "language" => "MetaBlockLang",
            "properties" => {
              "Name" => n
            }
          }
        end
      }
    }
  end
end
