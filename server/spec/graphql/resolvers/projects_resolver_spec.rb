require "rails_helper"

RSpec.fdescribe Resolvers::ProjectsResolver do
  it "can be instantiated" do
    res = Resolvers::ProjectsResolver.new
    expect(res).not_to be_nil
  end

  it "Loads all projects for empty parameters" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")

    res = Resolvers::ProjectsResolver.new(languages: ["de", "en"])
    expect(res.scope).to eq([p1, p2])
  end

  it "Loads all projects ordered by NAME ASC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "name" }
    )
    expect(res.scope).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered by NAME DESC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "name", orderDirection: "DESC" }
    )
    expect(res.scope).to eq([p3, p2, p1])
  end

  it "Has correctly partitioned columns" do
    res = Resolvers::ProjectsResolver.new

    expect(res.multilingual_columns).to eq(["name", "description"])
    expect(res.scalar_columns).to include("id", "public", "preview")
  end
end