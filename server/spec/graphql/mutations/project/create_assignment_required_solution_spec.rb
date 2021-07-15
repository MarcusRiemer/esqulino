require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredSolution do

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

  it "create assignment required solution normal work" do
    owner = create(:user)
    assignment = create(:assignment)

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.user = owner
    p.save! 

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)


    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block.id,
    )

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution).not_to eq nil
    expect( AssignmentRequiredCodeResource.first.solution.block_language).to eq block
    expect( AssignmentRequiredCodeResource.first.solution.programming_language).to eq requried.programming_language

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block2.id,
    )

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 2
    expect( AssignmentRequiredCodeResource.find(requried.id).solution).not_to eq nil
    expect( AssignmentRequiredCodeResource.find(requried.id).solution.block_language).to eq block2
    expect( AssignmentRequiredCodeResource.find(requried.id).solution.programming_language).to eq requried.programming_language
  end

  it "create assignment required solution wrong block_language" do
    owner = create(:user)
    assignment = create(:assignment)

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)


    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block2.id,
    )}.to raise_error(ArgumentError)

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution ).to eq nil


    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block3.id,
    )}.to raise_error(ArgumentError)

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution ).to eq nil

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: "12321",
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution ).to eq nil
  end

  it "create assignment required solution no permission" do
    owner = create(:user)
    assignment = create(:assignment)

    user = create(:user)

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)


    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block.id,
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution ).to eq nil
  end

  it "create assignment required solution with full_given template" do
    owner = create(:user)
    assignment = create(:assignment)

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)
    code_resource = create(:code_resource, project: p, block_language:block, programming_language: block.default_programming_language)
    template = AssignmentTemplateCodeResource.create(assignment_required_code_resource: requried, code_resource: code_resource, reference_type: "given_full")

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block.id,
    )}.to raise_error(ArgumentError)

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution ).to eq nil
  end



  it "create assignment required solution with given_partially template" do
    owner = create(:user)
    assignment = create(:assignment)

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)
    code_resource = create(:code_resource, project: p, block_language:block, programming_language: block.default_programming_language)
    template = AssignmentTemplateCodeResource.create(assignment_required_code_resource: requried, code_resource: code_resource, reference_type: "given_partially")

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_required_code_resource_id: requried.id,
      block_language_id: block.id,
    )

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.find(requried.id).solution).not_to eq nil
    expect( AssignmentRequiredCodeResource.find(requried.id).solution.block_language).to eq block
    expect( AssignmentRequiredCodeResource.find(requried.id).solution.programming_language).to eq requried.programming_language
  end

 


end