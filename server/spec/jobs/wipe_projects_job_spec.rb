# coding: utf-8
require 'rails_helper'

RSpec.describe WipeProjectsJob, type: :job do
  it "deletes an empty project" do
    create(:project)

    expect(Project.count).to eq(1)

    WipeProjectsJob.new.perform

    expect(Project.count).to eq(0)
  end

  it "deletes a project with a single code resource" do
    p = create(:project)
    create(:code_resource, project: p)

    expect(Project.count).to eq(1)
    expect(CodeResource.count).to eq(1)

    WipeProjectsJob.new.perform

    expect(Project.count).to eq(0)
    expect(CodeResource.count).to eq(0)
  end

  it "deletes a project with a single database" do
    p = create(:project)
    db = create(:project_database, project: p)

    expect(Project.count).to eq(1)
    expect(ProjectDatabase.count).to eq(1)
    expect(File.exists? db.sqlite_file_path).to be(true)

    WipeProjectsJob.new.perform

    expect(Project.count).to eq(0)
    expect(ProjectDatabase.count).to eq(0)
    expect(File.exists? db.sqlite_file_path).to be(false)
  end
end
