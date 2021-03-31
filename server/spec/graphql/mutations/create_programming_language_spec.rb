require "rails_helper"

RSpec.describe Mutations::CreateProgrammingLanguage do

  # These specs relies on
  # * an existing guest user
  # * an existing meta grammar language
  before(:each) {
    create(:user, :guest)
    create(:programming_language, id: "generic")
    prog_lang = create(:programming_language, :meta_grammar)
    grammar = create(
      :grammar,
      id: Grammar.meta_grammar_id,
      programming_language: prog_lang
    )

    create(
      :block_language,
      id: BlockLanguage.meta_grammar_id,
      grammar: grammar
    )
  }

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil,
    }
  end

  it "Registered user creates a new project" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_name: "l",
      runtime_language_id: "generic",
    )

    expect(Project.count).to eq 1
    p = Project.first

    # Grammar and initial code resource
    expect(CodeResource.count).to eq 2
    grammar_code_resource = CodeResource.find_by!(id: res[:grammar_code_resource][:id])
    expect(grammar_code_resource.name).to eq "Grammar: l"
    expect(grammar_code_resource.programming_language.id).to eq "meta-grammar"

    # Meta grammar and created grammar
    expect(Grammar.count).to eq 2
    grammar = Grammar.find_by!(id: res[:grammar][:id])
    expect(grammar.generated_from).to eq grammar_code_resource
    expect(grammar.name).to eq "l"
    expect(grammar.programming_language.id).to eq "meta-grammar"

    # Meta block language and created block language
    expect(BlockLanguage.count).to eq 2
    block_language = BlockLanguage.where.not(id: BlockLanguage.meta_grammar_id).first
    expect(block_language.grammar).to eq grammar
    expect(block_language.name).to eq "l"
    expect(block_language.default_programming_language.id).to eq "generic"
    expect(block_language.local_generator_instructions).to eq({
                                                                "type" => "manual"
                                                              })

    # Project must reference meta language and newly created language
    expect(p.project_uses_block_languages.pluck "block_language_id")
      .to match_array([block_language.id, BlockLanguage.meta_grammar_id])
  end
end