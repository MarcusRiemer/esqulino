require "rails_helper"

RSpec.describe Resolvers::ProjectsResolver do
  before(:each) { create(:user, :guest) }

  IDS_QUERY = <<-GQL
    query ProjectIds($input: ProjectInputType) {
      projects(input: $input) {
        nodes {
          id
          name
          slug
          description
        }
      }
    }
  GQL

  def exec_project_id_query(
        languages: nil,
        order: nil,
        filter: nil
      )
    variables = {
      input: {
        languages: languages,
        order: order,
        filter: filter
      }
    }
    res = execute_query(
      query: IDS_QUERY,
      variables: variables
    )

    # The specs expect active record models, so we built them from the response
    # and sort of abuse the fact that active record compares models only by ID.
    return res["data"]["projects"]["nodes"].map do |p_data|
      Project.new(**p_data)
    end
  end


  it "Loads all projects for empty parameters" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")

    res = exec_project_id_query(languages: ["de", "en"])
    expect(res).to match_array([p1, p2])
  end

  it "Loads all projects ordered COALESCE by multilingual NAME ASC" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { en: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })

    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderField: "name", orderDirection: "asc" }
    )

    expect(res).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered COALESCE by multilingual NAME DESC" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { en: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })

    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderField: "name", orderDirection: "desc" }
    )

    expect(res).to eq([p3, p2, p1])
  end

  it "Loads all projects ordered by scalar SLUG DESC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")
    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderField: "slug", orderDirection: "desc" }
    )
    expect(res).to eq([p3, p2, p1])
  end

  it "Loads all projects ordered by scalar SLUG ASC" do
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")
    p3 = FactoryBot.create(:project, slug: "number-3")

    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderField: "slug", orderDirection: "asc" }
    )
    expect(res).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered by scalar SLUG ASC per default when no orderDirection given" do
    p3 = FactoryBot.create(:project, slug: "number-3")
    p1 = FactoryBot.create(:project, slug: "number-1")
    p2 = FactoryBot.create(:project, slug: "number-2")

    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderField: "slug" }
    )
    expect(res).to eq([p1, p2, p3])
  end

  it "Loads all projects ordered by scalar NAME ASC per default when no orderField given" do
    p3 = FactoryBot.create(:project, name: { de: "hallo-3" })
    p1 = FactoryBot.create(:project, name: { de: "hallo-1" })
    p2 = FactoryBot.create(:project, name: { de: "hallo-2" })

    res = exec_project_id_query(
      languages: ["de", "en"],
      order: { orderDirection: "asc" }
    )
    expect(res).to eq([p1, p2, p3])
  end

  it "Loads one project, filtered by scalar column" do
    p = FactoryBot.create(:project, slug: "number-1")
    FactoryBot.create(:project, slug: "number-2")
    FactoryBot.create(:project, slug: "number-3")

    res = exec_project_id_query(
      languages: ["de", "en"],
      filter: { slug: "number-1" }
    )
    expect(res).to eq([p])
  end

  it "Loads one project, filtered by multilingual column" do
    p = FactoryBot.create(:project, name: { en: "hello-1", de: "hallo-1" })
    FactoryBot.create(:project, name: { en: "hello-2", de: "hallo-2" })
    FactoryBot.create(:project, name: { en: "hello-3", de: "hallo-3" })

    res = exec_project_id_query(
      languages: ["de", "en"],
      filter: { name: "hello-1" }
    )
    expect(res).to eq([p])
  end

  it "Load empty array by filtering all projects by scalar column (has to match exactly)" do
    FactoryBot.create(:project, slug: "number-1")
    FactoryBot.create(:project, slug: "number-2")
    FactoryBot.create(:project, slug: "number-3")

    res = exec_project_id_query(
      languages: ["de", "en"],
      filter: { slug: "number" }
    )
    expect(res).to eq([])
  end

  it "Load empty array by filtering all projects by multilingual column (has to match exactly)" do
    FactoryBot.create(:project, name: { de: "hallo-1", en: "hello-1" })
    FactoryBot.create(:project, name: { de: "hallo-2", en: "hello-2" })
    FactoryBot.create(:project, name: { de: "hallo-3", en: "hello-3" })

    res = exec_project_id_query(
      languages: ["de", "en"],
      filter: { name: "hallo" }
    )
    expect(res).to eq([])
  end

  it "Load empty array filtered by english column, but selecting german language first" do
    FactoryBot.create(:project, name: { en: "hello-1", de: "hallo-1" })
    FactoryBot.create(:project, name: { en: "hello-2", de: "hallo-2" })
    FactoryBot.create(:project, name: { en: "hello-3", de: "hallo-3" })

    res = exec_project_id_query(
      languages: ["de"],
      filter: { name: "hello-2" }
    )
    expect(res).to eq([])
  end

  it "Has empty field if requesting not provided language" do
    FactoryBot.create(:project, name: { de: "hallo-1" })

    res = exec_project_id_query(
      languages: ["en"]
    )
    expect(res.first.name).to eq({})
  end

  it "Get only languages which are requested in name column" do
    FactoryBot.create(:project, name: { de: "hallo", en: "hello" })
    FactoryBot.create(:project, name: { de: "hallo2" })
    FactoryBot.create(:project, name: { en: "hello4" })
    FactoryBot.create(:project, name: { en: "hello3" })

    res = exec_project_id_query(
      languages: ["en"]
    )
    res2 = exec_project_id_query(
      languages: ["de"]
    )
    expect(res.map { |p| p.name}).to eq([{ "en" => "hello" }, { "en" => "hello3" }, { "en" => "hello4" }, {}])
    expect(res2.map { |p| p.name}).to eq([{ "de" => "hallo" }, { "de" => "hallo2" }, {}, {}])
  end

  describe "Get only languages which are requested in description column" do
    before(:each) do
      FactoryBot.create(:project, description: { de: "hallo", en: "hello" })
      FactoryBot.create(:project, description: { de: "hallo2" })
      FactoryBot.create(:project, description: { en: "hello3" })
      FactoryBot.create(:project, description: { en: "hello4" })
    end

    it "for en" do
      res = exec_project_id_query(
        languages: ["en"]
      )
      expect(res.map { |p| p.description}).to match_array([
                                                            { "en" => "hello" },
                                                            {},
                                                            { "en" => "hello3" },
                                                            { "en" => "hello4" }
                                                          ])
    end

    it "for de" do
      res2 = exec_project_id_query(
        languages: ["de"]
      )

      expect(res2.map { |p| p.description}).to match_array([
                                                             { "de" => "hallo" },
                                                             { "de" => "hallo2" },
                                                             {},
                                                             {}
                                                           ])
    end
  end



  it "Loads all available languages if no language is requested in the query" do
    FactoryBot.create(:project, name: { de: "hallo-1", en: "hello-1" })

    res = exec_project_id_query()
    expect(res.first.name).to eq({ de: "hallo-1", en: "hello-1" }.stringify_keys)
  end

  it "Order multilingual fields with coalesce" do
    p1 = FactoryBot.create(:project, name: { de: "Trucklino", en: "Trucklino" })
    p2 = FactoryBot.create(:project, name: { de: "Drei Fragezeichen", en: "Three Investigators" })
    p3 = FactoryBot.create(:project, name: { de: "Test: Web" })

    res1 = exec_project_id_query(
      order: { orderField: "name", orderDirection: "asc" },
      languages: ["de", "en"]
    )

    res2 = exec_project_id_query(
      order: { orderField: "name", orderDirection: "asc" },
      languages: ["en", "de"]
    )
    expect(res1).to eq([p2, p3, p1])
    expect(res2).to eq([p3, p2, p1])
  end
end
