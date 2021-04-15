require 'rails_helper'

RSpec.describe CodeResource, type: :model do
  context "name" do
    it "rejects a missing name" do
      res = FactoryBot.build(:code_resource, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end

    it "rejects a blank name" do
      res = FactoryBot.build(:code_resource, name: " ")

      res.validate
      expect(res.errors["name"].length).to be 1
    end

    it "allows very short names" do
      res = FactoryBot.build(:code_resource, name: "a")

      res.validate
      expect(res.errors["name"].length).to be 0
    end
  end

  context "AST" do
    it "rejects nodes without a name" do
      res = FactoryBot.build(
        :code_resource,
        ast: {
          "language" => "specLang"
        }
      )

      res.validate
      expect(res.errors["ast"].length).to be 1
      expect(res.compiled).to be nil
    end

    it "rejects nodes without a language" do
      res = FactoryBot.build(
        :code_resource,
        ast: {
          "name" => "specRoot"
        }
      )

      res.validate
      expect(res.errors["ast"].length).to be 1
      expect(res.compiled).to be nil
    end

    it "accepts a missing root" do
      res = FactoryBot.build(:code_resource, ast: nil)
      res.validate
      expect(res.errors["ast"].length).to be 0
    end

    it "accepts a valid tree" do
      res = FactoryBot.create(
        :code_resource,
        ast: {
          "language" => "specLang",
          "name" => "specRoot"
        }
      )

      # Tree is valid, no errors expected
      expect(res.errors["ast"].length).to be 0

      # Compiled should be *something* after saving
      res.save!
      expect(res.compiled).not_to be_nil
      expect(res.ast).to validate_against "NodeDescription"
    end
  end

  context "to_full_api_response" do
    it "without AST" do
      api_response = FactoryBot.build(:code_resource, project: nil, ast: nil).to_full_api_response

      expect(api_response['name']).to be_a String
      expect(api_response['programmingLanguageId']).to be_a String
      expect(api_response['blockLanguageId']).to be_a String
    end

    it "with AST snake_case values" do
      ast = {
        "language" => "spec_lang",
        "name" => "spec_name"
      }
      api_response = FactoryBot.build(
        :code_resource,
        project: nil,
        ast: ast
      ).to_full_api_response

      # AST must not change
      expect(api_response['ast']).to eq ast
    end

    it "with AST snake_case keys" do
      ast = {
        "language" => "spec_lang",
        "name" => "spec_name",
        "children" => {
          "snake_case" => []
        }
      }

      api_response = FactoryBot.create(
        :code_resource,
        ast: ast
      ).to_full_api_response

      # AST must not change
      expect(api_response['ast']).to eq ast
    end
  end

  context "by_programming_language" do
    it "No resources available at all" do
      expect(CodeResource.list_by_programming_language("css")).to eq []
    end

    it "A single sql resource" do
      res = FactoryBot.create(:code_resource, :sql_key_value_select_double)

      queried = CodeResource.list_by_programming_language("sql")
      expect(queried).to eq([res])
      expect(queried[0].attributes.keys).to eq(["id", "name"])
    end

    it "A single sql resource and a unrelated resource" do
      FactoryBot.create(:code_resource)
      res = FactoryBot.create(:code_resource, :sql_key_value_select_double)

      queried = CodeResource.list_by_programming_language("sql")
      expect(queried).to eq([res])
      expect(queried[0].attributes.keys).to eq(["id", "name"])
      expect(queried[0].to_json_api_response.keys).to eq(["id", "name"])
    end
  end

  context "Traits for builtin snippets" do
    it "SQL" do
      res = FactoryBot.build(:code_resource, :sql_key_value_select_double)
      expect(res.programming_language_id).to eq "sql"
    end

    it "Meta Grammar" do
      res = FactoryBot.build(:code_resource, :grammar_single_type)
      expect(res.programming_language_id).to eq "meta-grammar"
    end
  end

  context "immediate_dependants" do
    it "is empty if nothing depends on this" do
      res = FactoryBot.build(:code_resource, :grammar_single_type)
      expect(res.immediate_dependants.to_a).to eq []
    end

    it "with a single grammar" do
      res = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: res)

      expect(res.immediate_dependants.to_a).to eq [grammar]
    end

    it "with a single generated block language" do
      res = FactoryBot.create(:code_resource)
      block_lang = FactoryBot.create(:block_language, generated_from: res)

      expect(res.immediate_dependants.to_a).to eq [block_lang]
    end
  end

  context "update_this_and_dependants" do
    it "doesn't update if there is no change" do
      code = FactoryBot.create(:code_resource, :grammar_single_type)
      result = code.update_this_and_dependants!({
                                                 name: code.name
                                               })

      expect(result).to eq []
      expect(code.changed?).to eq false
    end

    it "does update itself if there is a change" do
      code = FactoryBot.create(:code_resource, :grammar_single_type)
      result = code.update_this_and_dependants!({
                                                 name: "New"
                                               })

      expect(result).to eq []
      expect(code.name).to eq "New"
      expect(code.changed?).to eq false
    end

    it "does update others if there is a change" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)

      result = related.update_this_and_dependants!({
                                                     name: "New"
                                                   })

      expect(result).to eq [grammar]
      expect(related.name).to eq "New"
      expect(related.changed?).to eq false
    end
  end

  context "regenerate_immediate_dependants!" do
    it "is empty if nothing depends on this" do
      unrelated = FactoryBot.create(:grammar)
      res = FactoryBot.create(:code_resource, :grammar_single_type)
      changed = res.regenerate_immediate_dependants!

      expect(changed).to eq []
    end

    it "with a single grammar that isn't used for a block language" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar]
    end

    it "with a single grammar that affects a block language" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)
      block_language = FactoryBot.create(:block_language, :auto_generated_blocks, grammar: grammar)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar, block_language]
    end

    it "with a single grammar that affects a block language that can't be regenerated" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)
      block_language = FactoryBot.create(:block_language, grammar: grammar)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar]
    end

    it "with a single grammar that affects two block languages (both not regeneratable)" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)
      b1 = FactoryBot.create(:block_language, grammar: grammar)
      b2 = FactoryBot.create(:block_language, grammar: grammar)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar]
    end

    it "with a single grammar that affects two block languages (both regeneratable)" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)
      b1 = FactoryBot.create(:block_language, :auto_generated_blocks, grammar: grammar)
      b2 = FactoryBot.create(:block_language, :auto_generated_blocks, grammar: grammar)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar, b1, b2]
    end

    it "with a single grammar that affects two block languages (mixed)" do
      related = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: related)
      b1 = FactoryBot.create(:block_language, grammar: grammar)
      b2 = FactoryBot.create(:block_language, :auto_generated_blocks, grammar: grammar)

      changed = related.regenerate_immediate_dependants!(ide_service: IdeService.guaranteed_instance)
      expect(changed).to match_array [grammar, b2]
    end
  end

  context "synchronize code resource references" do
    it "Non persisted records can't be updated" do
      c = FactoryBot.build(:code_resource, :grammar_code_resource_references)

      expect { c.update_code_resource_references! }.to raise_error EsqulinoError::Base
    end

    it "Empty AST has no references" do
      c = FactoryBot.create(:code_resource, :grammar_code_resource_references)

      refs = c.update_code_resource_references!(ide_service: IdeService.guaranteed_instance)
      expect(refs).to match_array []
    end

    it "New reference to an existing resource" do
      ref_1 = FactoryBot.create(:code_resource);
      c = FactoryBot.create(:code_resource, :grammar_code_resource_references, ast: {
                              language: "l",
                              name: "r",
                              properties: { ref1: ref_1.id }
                            })

      expect(c.targeted_code_resources).to match_array [ref_1]
      expect(CodeResourceReference.count).to eq 1
    end

    it "Change reference to an existing resource" do
      ref_old = FactoryBot.create(:code_resource);
      ref_new = FactoryBot.create(:code_resource);
      c = FactoryBot.create(:code_resource, :grammar_code_resource_references, ast: {
                              language: "l",
                              name: "r",
                              properties: { ref1: ref_old.id }
                            })

      expect(c.targeted_code_resources).to match_array [ref_old]
      expect(CodeResourceReference.count).to eq 1

      c.ast = {
        language: "l",
        name: "r",
        properties: { ref1: ref_new.id }
      }

      c.save!
      c.reload # Required for targeted_code_resources

      expect(c.targeted_code_resources).to match_array [ref_new]
      expect(CodeResourceReference.count).to eq 1
    end
  end

  it "project is required" do
    res = FactoryBot.build(:code_resource, project: nil)

    res.validate
    expect(res.errors[:project].length).to be 1
  end

  it "block language is required" do
    res = FactoryBot.build(:code_resource, block_language: nil)

    res.validate
    expect(res.errors[:block_language].length).to be 1
  end

  it "does not use block languages that are not part of the project" do
    p = FactoryBot.build(:project)
    res = FactoryBot.build(:code_resource, project: p)
    res.block_language = FactoryBot.build(:block_language)

    expect(res.validate).to be false
    expect(res.errors[:block_language].length).to be 1
  end

  it "prints a readable identification" do
    res = FactoryBot.create(:code_resource)
    readable = res.readable_identification
    expect(readable).to include res.id
    expect(readable).to include res.name
  end
end
