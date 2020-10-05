require "rails_helper"

lang_single_type = {
  "lang" => {
    "root" => {
      "type" => "concrete",
      "attributes" => []
    }
  }
}

RSpec.describe Mutations::Grammar::RegenerateForeignTypes do
  # These specs rely on an existing guest user
  before(:each) { create(:user, :guest) }

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil,
    }
  end

  it "grammar without reference" do
    g = FactoryBot.create(:grammar)
    mut = Mutations::Grammar::RegenerateForeignTypes.new(**init_args)
    res = mut.resolve(id: g.id)

    expect(g.foreign_types).to eq({})
  end

  it "grammar with reference" do
    inc_1 = FactoryBot.create(:grammar, foreign_types: lang_single_type)

    g = FactoryBot.create(:grammar)
    g.grammar_reference_origins.create(target: inc_1, reference_type: "include_types")

    mut = Mutations::Grammar::RegenerateForeignTypes.new(**init_args)
    res = mut.resolve(id: g.id)

    expect(res[:grammar].foreign_types).to eq(lang_single_type)
  end
end

RSpec.describe Mutations::Grammar::RegenerateForeignTypes, :type => :request do
  # These specs rely on an existing guest user
  before(:each) { create(:user, :guest) }

  json_headers = { "CONTENT_TYPE" => "application/json" }

  it "grammar without reference" do
    g = FactoryBot.create(:grammar)

    post "/api/graphql",
         :headers => json_headers,
         :params => {
           operationName: "RegenerateForeignTypes",
           query: %{
             regenerateForeignTypes(input: {id: $id}) {
               grammar {
                 foreignTypes
               }
             }
           },
           variables: {
             id: g.id
           }
         }.to_json

    aggregate_failures do
      expect(response.status).to eq 200
    end
  end

  it "grammar with reference" do
    inc_1 = FactoryBot.create(:grammar, foreign_types: lang_single_type)

    g = FactoryBot.create(:grammar)
    g.grammar_reference_origins.create(target: inc_1, reference_type: "include_types")

    post "/api/graphql",
         :headers => json_headers,
         :params => {
           operationName: "RegenerateForeignTypes",
           query: %{
mutation RegenerateForeignTypes($id: ID!) {
  regenerateForeignTypes(input: {id: $id}) {
    grammar {
      foreignTypes
    }
  }
}
           },
           variables: {
             id: g.id
           }
         }.to_json

    response_json = JSON.parse response.body

    aggregate_failures do
      expect(response.status).to eq 200
      expect(response_json).to eq ({
        "data" => {
          "regenerateForeignTypes" => {
            "__typename" => "RegenerateForeignTypesPayload",
            "grammar" => {
              "__typename" => "Grammar",
              "foreignTypes" => lang_single_type
            }
          }
        }
      })
    end
  end
end
