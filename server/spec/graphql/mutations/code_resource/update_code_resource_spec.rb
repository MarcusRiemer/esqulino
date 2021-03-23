require "rails_helper"

RSpec.describe Mutations::CodeResource::Update do
  # These specs rely on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  def execute_args(code_resource, user: nil)
    if user.nil?
      user = code_resource.project.user
    end

    attributes = code_resource.attributes.slice(
      "id", "name", "ast", "block_language_id", "programming_language_id"
    ).transform_keys { |k| k.camelize(:lower) }

    {
      operation_name: "UpdateCodeResource",
      variables: attributes,
      user: user
    }
  end

  it "changes the name" do
    resource = FactoryBot.create(:code_resource, name: "Initial")
    resource.name = "Changed"

    res = execute_query(**execute_args(resource))
    data = res.dig("data", "updateCodeResource", "codeResource")

    aggregate_failures do
      resource.reload
      expect(resource.name).to eq "Changed"
      expect(data['name']).to eq "Changed"
    end
  end

  it "changes the programming language" do
    new_lang = FactoryBot.create(:programming_language)
    resource = FactoryBot.create(:code_resource, name: "Initial")
    resource.programming_language = new_lang

    res = execute_query(**execute_args(resource))
    data = res.dig("data", "updateCodeResource", "codeResource")

    aggregate_failures do
      resource.reload
      expect(resource.programming_language).to eq new_lang
      expect(data['programmingLanguageId']).to eq new_lang.id
    end
  end

  it "changes the programming language" do
    new_lang = FactoryBot.create(:programming_language)
    resource = FactoryBot.create(:code_resource, name: "Initial")
    resource.programming_language = new_lang

    res = execute_query(**execute_args(resource))
    data = res.dig("data", "updateCodeResource", "codeResource")

    aggregate_failures do
      resource.reload
      expect(resource.programming_language).to eq new_lang
      expect(data['programmingLanguageId']).to eq new_lang.id
    end
  end

  it "removes an existing AST" do
    resource = FactoryBot.create(:code_resource, :grammar_single_type)
    resource.ast = nil

    res = execute_query(**execute_args(resource))
    data = res.dig("data", "updateCodeResource", "codeResource")

    aggregate_failures do
      resource.reload
      expect(resource.ast).to eq nil
      expect(data['ast']).to eq nil
    end
  end

  it "sets a new AST" do
    new_ast = { "language" => "l", "name" => "r" }
    resource = FactoryBot.create(:code_resource, :grammar_single_type)
    resource.ast = new_ast

    res = execute_query(**execute_args(resource))
    data = res.dig("data", "updateCodeResource", "codeResource")

    aggregate_failures do
      resource.reload
      expect(resource.ast).to eq new_ast
      expect(data['ast']).to eq new_ast
    end
  end
end