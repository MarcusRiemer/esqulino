require 'rails_helper'

RSpec.describe 'Rake Model Validation' do

  # Setup specs for rake
  before :all do
    Rake.application.rake_require "tasks/validate_database"
    Rake::Task.define_task(:environment)
  end

  # Helper method to run a task
  def run_validation_task(resource, task, params = "")
    task_name = "blattwerkzeug:#{resource}:#{task}"
    parm_task = "#{task_name}[#{params}]"
    Rake::Task[task_name].reenable
    Rake.application.invoke_task parm_task
  end

  describe "Project" do
    it "validate_all without any projects" do
      res = verify_all_projects

      expect(res).to eq []
      expect{ run_validation_task("project", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all with only valid projects" do
      FactoryBot.create(:project)
      FactoryBot.create(:project)

      res = verify_all_projects

      expect(res).to eq []
      expect{ run_validation_task("project", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all with valid and invalid project" do
      FactoryBot.create(:project) # Valid project

      p = FactoryBot.build(:project, slug: "?", name: "") # Invalid
      p.save(validate: false)

      res = verify_all_projects

      expect(res).to eq [p]
      expect{ run_validation_task("project", "validate_all") }.to output.to_stdout
    end

    it "validate valid project with valid and invalid project" do
      FactoryBot.create(:project) # Valid project

      p = FactoryBot.build(:project, slug: "?", name: "") # Invalid
      p.save(validate: false)

      res = verify_project(p)

      expect(res).to eq [p]
      expect{ run_validation_task("project", "validate", p.id) }.to output.to_stdout
    end

    it "validate_all with valid project that has invalid resources" do
      p = FactoryBot.create(:project) # Valid project

      # But with an invalid resource
      c = FactoryBot.build(:code_resource, name: "", ast: Hash.new({ "foo" => "bar" }), project: p)

      c.save(validate: false)

      res = verify_all_projects

      expect(res).to eq [c]
      expect{ run_validation_task("project", "validate_all") }.to output.to_stdout
    end
  end

  describe "Grammar" do
    it "validate_all without any records" do
      res = select_all_invalid_grammars

      expect(res).to eq []
      expect{ run_validation_task("grammar", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all without only valid records" do
      FactoryBot.create(:grammar)
      FactoryBot.create(:grammar)

      res = select_all_invalid_grammars

      expect(res).to eq []
      expect{ run_validation_task("grammar", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all with valid and invalid record" do
      FactoryBot.create(:grammar) # Valid

      # Invalid, there should never be a node type "invalid", so this will trigger
      # the schema validation
      p = FactoryBot.build(:grammar, types: {
                             "spec" => {
                               "root" => {
                                 "type" => "invalid"
                               }
                             }
                           })
      p.save(validate: false)

      res = select_all_invalid_grammars

      expect(res).to eq [p]
      expect{ run_validation_task("grammar", "validate_all") }.to output.to_stdout
    end
  end

  describe "BlockLanguage" do
    it "validate_all without any records" do
      res = select_all_invalid_block_languages

      expect(res).to eq []
      expect{ run_validation_task("block_language", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all without only valid records" do
      FactoryBot.create(:block_language)
      FactoryBot.create(:block_language)

      res = select_all_invalid_block_languages

      expect(res).to eq []
      expect{ run_validation_task("block_language", "validate_all") }.to_not output.to_stdout
    end

    it "validate_all with valid and invalid record" do
      FactoryBot.create(:block_language) # Valid

      # Invalid, partially because of given values, partially because fields are missing
      p = FactoryBot.build(:block_language, model: {
                             "sidebars" => false # Should be an array
                           })
      p.save(validate: false)

      res = select_all_invalid_block_languages

      expect(res).to eq [p]
      expect{ run_validation_task("block_language", "validate_all") }.to output.to_stdout
    end
  end
end