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