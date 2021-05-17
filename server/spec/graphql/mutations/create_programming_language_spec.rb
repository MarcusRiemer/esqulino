require "rails_helper"

RSpec.describe Mutations::CreateProgrammingLanguage do

  # These specs relies on
  # * an existing guest user
  # * an existing meta grammar language
  before(:each) {
    create(:user, :guest)
    create(:programming_language, id: "generic")

    meta_prog_lang = create(:programming_language, :meta_grammar)
    meta_block_lang = create(:programming_language, :meta_block_language)

    meta_grammar = create(
      :grammar,
      id: Grammar.meta_grammar_id,
      programming_language: meta_prog_lang
    )

    create(
      :block_language,
      id: BlockLanguage.meta_grammar_id,
      grammar: meta_grammar
    )

    meta_block_lang_grammar = create(
      :grammar,
      id: Grammar.meta_block_language_id,
      programming_language: meta_block_lang
    )

    create(
      :block_language,
      id: BlockLanguage.meta_block_language_id,
      grammar: meta_block_lang_grammar
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

  it "New minimal language: single grammar, no meta block language and no code resource" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_display_name: "My Language",
      language_technical_name: "l",
      runtime_language_id: "generic",
      create_initial_code_resource: false,
      create_structure_and_syntax_grammar: false,
      create_meta_block_language: false,
    )

    expect(Project.count).to eq 1
    p = Project.first

    # Grammar but no initial code resource
    expect(CodeResource.count).to eq 1
    grammar_code_resource = CodeResource.find_by!(id: res[:structure_grammar_code_resource][:id])
    expect(grammar_code_resource.name).to eq "Grammar: My Language"
    expect(grammar_code_resource.ast).to eq ({
                                               "name" => "grammar",
                                               "children" => {"root"=>[], "nodes"=>[]},
                                               "language" => "MetaGrammar",
                                               "properties" => {"name"=>"l"}
                                             })
    expect(grammar_code_resource.programming_language.id).to eq "meta-grammar"

    # Meta grammar, meta block language and created grammar
    expect(Grammar.count).to eq 3
    grammar = Grammar.find_by!(id: res[:structure_grammar][:id])
    expect(grammar.generated_from).to eq grammar_code_resource
    expect(grammar.name).to eq "My Language"
    expect(grammar.programming_language.id).to eq "meta-grammar"

    # Meta grammar block language, meta block language and created block language
    expect(BlockLanguage.count).to eq 3
    block_language = BlockLanguage.find_by(id: res[:created_block_language_usage][:block_language_id])
    expect(block_language.grammar).to eq grammar
    expect(block_language.name).to eq "My Language"
    expect(block_language.default_programming_language.id).to eq "generic"
    expect(block_language.local_generator_instructions).to eq({
                                                                "type" => "manual"
                                                              })

    # Project must reference meta language and newly created language
    expect(p.project_uses_block_languages.pluck "block_language_id")
      .to match_array([block_language.id, BlockLanguage.meta_grammar_id])
  end

  it "New language: single grammar, initial code resource but no meta block language" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_display_name: "My Language",
      language_technical_name: "l",
      runtime_language_id: "generic",
      create_initial_code_resource: true,
      create_structure_and_syntax_grammar: false,
      create_meta_block_language: false,
    )

    expect(Project.count).to eq 1
    p = Project.first

    # Grammar and initial code resource
    expect(CodeResource.count).to eq 2
    grammar_code_resource = CodeResource.find_by!(id: res[:structure_grammar_code_resource][:id])
    expect(grammar_code_resource.name).to eq "Grammar: My Language"
    expect(grammar_code_resource.ast).to eq ({
                                               "name" => "grammar",
                                               "children" => {"root"=>[], "nodes"=>[]},
                                               "language" => "MetaGrammar",
                                               "properties" => {"name"=>"l"}
                                             })
    expect(grammar_code_resource.programming_language.id).to eq "meta-grammar"

    # Meta grammar, meta block language grammar and created grammar
    expect(Grammar.count).to eq 3
    grammar = Grammar.find_by!(id: res[:structure_grammar][:id])
    expect(grammar.generated_from).to eq grammar_code_resource
    expect(grammar.name).to eq "My Language"
    expect(grammar.programming_language.id).to eq "meta-grammar"

    # Meta grammar block language, meta block language and created block language
    expect(BlockLanguage.count).to eq 3
    block_language = BlockLanguage.find_by(id: res[:created_block_language_usage][:block_language_id])
    expect(block_language.grammar).to eq grammar
    expect(block_language.name).to eq "My Language"
    expect(block_language.default_programming_language.id).to eq "generic"
    expect(block_language.local_generator_instructions).to eq({
                                                                "type" => "manual"
                                                              })

    # Project must reference meta language and newly created language
    expect(p.project_uses_block_languages.pluck "block_language_id")
      .to match_array([block_language.id, BlockLanguage.meta_grammar_id])
  end

  it "New language: structure and syntax grammar, no initial resource, no meta block language" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_display_name: "My Language",
      language_technical_name: "l",
      runtime_language_id: "generic",
      create_initial_code_resource: false,
      create_structure_and_syntax_grammar: true,
      create_meta_block_language: false,
    )

    # Two Grammars
    expect(CodeResource.count).to(eq(2))

    structure_code_resource = CodeResource.find_by!(id: res[:structure_grammar_code_resource][:id])
    structure_grammar = Grammar.find_by!(id: res[:structure_grammar][:id])
    expect(structure_grammar.generated_from).to eq structure_code_resource

    syntax_code_resource = CodeResource.find_by!(id: res[:syntax_grammar_code_resource][:id])
    syntax_grammar = Grammar.find_by!(id: res[:syntax_grammar][:id])
    expect(syntax_grammar.generated_from).to eq syntax_code_resource

    block_language = BlockLanguage.find_by(id: res[:created_block_language_usage][:block_language_id])
    expect(block_language.grammar).to eq syntax_grammar
  end

  it "New language: structure and syntax grammar, with initial resource (targets syntax), no meta block language" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_display_name: "My Language",
      language_technical_name: "l",
      runtime_language_id: "generic",
      create_initial_code_resource: true,
      create_structure_and_syntax_grammar: true,
      create_meta_block_language: false,
    )

    # Two Grammars and the initial code resource
    expect(CodeResource.count).to(eq(3))

    structure_code_resource = CodeResource.find_by!(id: res[:structure_grammar_code_resource][:id])
    structure_grammar = Grammar.find_by!(id: res[:structure_grammar][:id])
    expect(structure_grammar.generated_from).to eq structure_code_resource

    syntax_code_resource = CodeResource.find_by!(id: res[:syntax_grammar_code_resource][:id])
    syntax_grammar = Grammar.find_by!(id: res[:syntax_grammar][:id])
    expect(syntax_grammar.generated_from).to eq syntax_code_resource

    # Block language must target syntax grammar
    block_language = BlockLanguage.find_by(id: res[:created_block_language_usage][:block_language_id])
    expect(block_language.grammar).to eq syntax_grammar
  end

  it "New language: Only structure grammar without initial code resource but with meta block language" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_display_name: "My Language",
      language_technical_name: "l",
      runtime_language_id: "generic",
      create_initial_code_resource: false,
      create_structure_and_syntax_grammar: true,
      create_meta_block_language: true,
    )

    # structure grammar + syntax grammar + Meta Block language but no initial code resource
    expect(CodeResource.count).to(eq(3))

    structure_code_resource = CodeResource.find_by!(id: res[:structure_grammar_code_resource][:id])
    structure_grammar = Grammar.find_by!(id: res[:structure_grammar][:id])
    expect(structure_grammar.generated_from).to eq structure_code_resource

    syntax_code_resource = CodeResource.find_by!(id: res[:syntax_grammar_code_resource][:id])
    syntax_grammar = Grammar.find_by!(id: res[:syntax_grammar][:id])
    expect(syntax_grammar.generated_from).to eq syntax_code_resource

    block_language = BlockLanguage.find_by(id: res[:created_block_language_usage][:block_language_id])
    expect(block_language.grammar).to eq syntax_grammar
  end
end