require 'rails_helper'

RSpec.describe Project do
  context "slug" do
    it "allows empty slugs" do
      res = FactoryBot.build(:project, slug: nil)
      expect(res.valid?).to be true
    end

    it "allows valid slugs" do
      ["aa", "ab", "a1", "a_b", "a-b"].each do |s|
        res = FactoryBot.build(:project, slug: s)
        expect(res.errors["slug"]).to eq([])
      end
    end

    it "rejects slugs that are too short" do
      res = FactoryBot.build(:project, slug: "")

      res.validate
      expect(res.errors["slug"].length).to eq 1
    end

    it "stores two projects with empty slugs" do
      p1 = FactoryBot.create(:project, slug: nil)
      p2 = FactoryBot.create(:project, slug: nil)

      expect(Project.all.count).to eq 2
      expect(Project.where(slug: nil).count).to be 2
    end
  end

  context "find_by_slug_or_id!" do
    it "existing slug" do
      p1 = FactoryBot.create(:project, slug: "test")
      p2 = FactoryBot.create(:project, slug: "test2")
      p = Project.find_by_slug_or_id! p1.slug

      expect(p1.id).to eq(p.id)
    end

    it "existing slug" do
      p1 = FactoryBot.create(:project, slug: "test")
      p2 = FactoryBot.create(:project, slug: "test2")
      p = Project.find_by_slug_or_id! p1.id

      expect(p1.id).to eq(p.id)
    end
  end

  context "directories" do
    it "end with the UUID" do
      p = FactoryBot.build(:project, id: SecureRandom.uuid)
      expect(p.data_directory_path).to end_with(p.id)
    end
  end

  it "prints a readable identification" do
    res = FactoryBot.create(:project, slug: "sluggy")
    readable = res.readable_identification
    expect(readable).to include res.id
    expect(readable).to include res.name.inspect
    expect(readable).to include res.slug
  end
end
