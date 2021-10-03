require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredTemplateFrom do

  # These specs relies on
  # * an existing guest user
  before(:each) {
    create(:user, :guest)
  } 

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil,
    }
  end

  it "normal work deep copy with reference_type given_full " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_full",
        deep_copy: true
    )

    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "description1"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_full"
    expect(AssignmentRequiredCodeResource.first.template.code_resource).not_to eq cr
    expect(AssignmentRequiredCodeResource.first.template.code_resource.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.code_resource.block_language).to eq cr.block_language
    expect(AssignmentRequiredCodeResource.first.template.code_resource.project).to eq project
    expect(AssignmentRequiredCodeResource.first.template.code_resource.name).to eq "Test"
    expect(CodeResource.find(cr.id).name).not_to eq "Test"
  end

  it "normal work shallow copy with reference_type given_full " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_full",
        deep_copy: false
    )

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "description1"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_full"
    expect(AssignmentRequiredCodeResource.first.template.code_resource).to eq cr
    expect(AssignmentRequiredCodeResource.first.template.code_resource.name).not_to eq "Test"
  end

  it "normal work deep copy with reference_type given_partially" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_partially",
        deep_copy: true
    )

    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "description1"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_partially"
    expect(AssignmentRequiredCodeResource.first.template.code_resource).not_to eq cr
    expect(AssignmentRequiredCodeResource.first.template.code_resource.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.code_resource.block_language).to eq cr.block_language
    expect(AssignmentRequiredCodeResource.first.template.code_resource.project).to eq project
    expect(CodeResource.find(cr.id).name).not_to eq "Test"
  end

  it "normal work shallow copy with reference_type given_partially" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_partially",
        deep_copy: false
    )

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "description1"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_partially"
    expect(AssignmentRequiredCodeResource.first.template.code_resource).to eq cr
    expect(AssignmentRequiredCodeResource.first.template.code_resource.name).not_to eq "Test"
  end

  it "problems with code resource" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)
    allow(cr).to receive(:save!).and_raise('boom')

    mut = described_class.new(**init_args(user: owner))
    mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_full",
        deep_copy: true
    )

  end

  it "code resource is not existing in the project" do
    owner = create(:user)

    user = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: user))
   expect{mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_partially",
        deep_copy: false
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 0
  end

  it "no permissions" do
    owner = create(:user)

    user = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2, block3 ]
    project.user = owner
    project.save! 

    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: user))
   expect{mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_partially",
        deep_copy: false
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 0

    expect{mut.resolve(
        assignment_id: assignment.id,
        code_resource_id: cr.id, 
        name: "Test",
        description:  "description1",
        reference_type: "given_full",
        deep_copy: false
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 0
  end
end