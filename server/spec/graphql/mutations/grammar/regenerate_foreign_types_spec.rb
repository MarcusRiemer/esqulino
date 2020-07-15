require "rails_helper"

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
    types = {
      "lang" => {
        "root" => {
          "type" => "concrete",
          "attributes" => []
        }
      }
    }
    inc_1 = FactoryBot.create(:grammar, foreign_types: types)

    g = FactoryBot.create(:grammar)
    g.grammar_reference_origins.create(target: inc_1, reference_type: "include_types")

    mut = Mutations::Grammar::RegenerateForeignTypes.new(**init_args)
    res = mut.resolve(id: g.id)

    expect(res[:grammar].foreign_types).to eq(types)
  end
end