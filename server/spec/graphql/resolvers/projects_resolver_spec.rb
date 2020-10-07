require "rails_helper"

RSpec.describe Resolvers::ProjectsResolver do
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

  it "Loads all projects ordered COALESCE by multilingual NAME ASC" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { en: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "name", orderDirection: "asc" }
    )
    expect(res.scope).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered COALESCE by multilingual NAME DESC" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { en: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })
    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "name", orderDirection: "desc" }
    )
    expect(res.scope).to eq([p3, p2, p1])
  end

  it "Loads all projects ordered by scalar SLUG DESC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")
    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "slug", orderDirection: "desc" }
    )
    expect(res.scope).to eq([p3, p2, p1])
  end

  it "Loads all projects ordered by scalar SLUG ASC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "slug", orderDirection: "asc" }
    )
    expect(res.scope).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered by scalar SLUG ASC per default when no orderDirection given" do
    p3 = FactoryBot.create(:project, slug: "number-3")
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderField: "slug" }
    )
    expect(res.scope).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered by scalar NAME ASC per default when no orderField given" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { de: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      order: { orderDirection: "asc" }
    )
    expect(res.scope).to eq([p1, p2, p3])
  end

  it "Has correctly partitioned columns" do
    res = Resolvers::ProjectsResolver.new

    expect(res.multilingual_columns).to eq(["name", "description"])
    expect(res.scalar_columns).to include("id", "public", "preview")
  end

  it "Loads one project, filtered by scalar column" do
    p = FactoryBot.create(:project, slug: "number-1")
    FactoryBot.create(:project, slug: "number-2")
    FactoryBot.create(:project, slug: "number-3")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      filter: { slug: "number-1" }
    )
    expect(res.scope).to eq([p])
  end

  it "Loads one project, filtered by multilingual column" do
    p = FactoryBot.create(:project, name: { en: "hello-1", de: "hallo-1" })
    FactoryBot.create(:project, name: { en: "hello-2", de: "hallo-2" })
    FactoryBot.create(:project, name: { en: "hello-3", de: "hallo-3" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      filter: { name: "hello-1" }
    )
    expect(res.scope).to eq([p])
  end

  it "Load empty array by filtering all projects by scalar column (has to match exactly)" do
    FactoryBot.create(:project, slug: "number-1")
    FactoryBot.create(:project, slug: "number-2")
    FactoryBot.create(:project, slug: "number-3")

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      filter: { slug: "number" }
    )
    expect(res.scope).to eq([])
  end

  it "Load empty array by filtering all projects by multilingual column (has to match exactly)" do
    FactoryBot.create(:project, name: { de: "hallo-1", en: "hello-1" })
    FactoryBot.create(:project, name: { de: "hallo-2", en: "hello-2" })
    FactoryBot.create(:project, name: { de: "hallo-3", en: "hello-3" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["de", "en"],
      filter: { name: "hallo" }
    )
    expect(res.scope).to eq([])
  end

  it "Load empty array filtered by english column, but selecting german language first" do
    FactoryBot.create(:project, name: { en: "hello-1", de: "hallo-1" })
    FactoryBot.create(:project, name: { en: "hello-2", de: "hallo-2" })
    FactoryBot.create(:project, name: { en: "hello-3", de: "hallo-3" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["de"],
      filter: { name: "hello-2" }
    )
    expect(res.scope).to eq([])
  end

  it "Has empty field if requesting not provided language" do
    FactoryBot.create(:project, name: { de: "hallo-1" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["en"]
    )
    expect(res.scope.first.name).to eq({})
  end

  it "Get only languages which are requested in name column" do
    FactoryBot.create(:project, name: { de: "hallo", en: "hello" })
    FactoryBot.create(:project, name: { de: "hallo2" })
    FactoryBot.create(:project, name: { en: "hello4" })
    FactoryBot.create(:project, name: { en: "hello3" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["en"]
    )
    res2 = Resolvers::ProjectsResolver.new(
      languages: ["de"]
    )
    expect(res.scope.map { |p| p.name}).to eq([{ "en" => "hello" }, { "en" => "hello3" }, { "en" => "hello4" }, {}])
    expect(res2.scope.map { |p| p.name}).to eq([{ "de" => "hallo" }, { "de" => "hallo2" }, {}, {}])
  end

  it "Get only languages which are requested in description column" do
    FactoryBot.create(:project, description: { de: "hallo", en: "hello" })
    FactoryBot.create(:project, description: { de: "hallo2" })
    FactoryBot.create(:project, description: { en: "hello3" })
    FactoryBot.create(:project, description: { en: "hello4" })

    res = Resolvers::ProjectsResolver.new(
      languages: ["en"]
    )
    res2 = Resolvers::ProjectsResolver.new(
      languages: ["de"]
    )
    expect(res.scope.map { |p| p.description}).to eq([{ "en" => "hello" }, {}, { "en" => "hello3" }, { "en" => "hello4" }])
    expect(res2.scope.map { |p| p.description}).to eq([{ "de" => "hallo" }, { "de" => "hallo2" }, {}, {}])
  end

  it "Throws exception when creating project with not provided language keys" do
    expect {
      FactoryBot.create(:project, name: { fr: "hallo", en: "hello" })
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "Loads all available languages if no language is requested in the query" do
    FactoryBot.create(:project, name: { de: "hallo-1", en: "hello-1" })

    res = Resolvers::ProjectsResolver.new()
    expect(res.scope.first.name).to eq({ de: "hallo-1", en: "hello-1" }.stringify_keys)
  end

  it "Order multilingual fields with coalesce" do
    p1 = FactoryBot.create(:project, name: { de: "Trucklino", en: "Trucklino" })
    p2 = FactoryBot.create(:project, name: { de: "Drei Fragezeichen", en: "Three Investigators" })
    p3 = FactoryBot.create(:project, name: { de: "Test: Web" })

    res1 = Resolvers::ProjectsResolver.new(
      order: { orderField: "name", orderDirection: "asc" },
      languages: ["de", "en"]
    )

    res2 = Resolvers::ProjectsResolver.new(
      order: { orderField: "name", orderDirection: "asc" },
      languages: ["en", "de"]
    )
    expect(res1.scope).to eq([p2, p3, p1])
    expect(res2.scope).to eq([p3, p2, p1])
  end
end
