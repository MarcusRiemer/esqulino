require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredSolutionFrom do

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


  it "normal work deep copy" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )

    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "Beschreibung"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).not_to eq cr
    expect(AssignmentRequiredCodeResource.first.solution.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution.block_language).to eq cr.block_language
    expect(AssignmentRequiredCodeResource.first.solution.project).to eq project
  end

  it " normal work shallow copy " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: false
    )

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.first.description).to eq "Beschreibung"
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq cr
    expect(AssignmentRequiredCodeResource.first.solution.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution.block_language).to eq cr.block_language
    expect(AssignmentRequiredCodeResource.first.solution.project).to eq project
end

  it "normal work deep copy for template " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: assignment_required_cd.id, reference_type: "given_partially")

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )

    expect(CodeResource.count).to eq 3
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).not_to eq cr
    expect(AssignmentRequiredCodeResource.first.solution.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution.block_language).to eq cr.block_language
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_partially"

  end

  it "normal work shallow copy for template " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: assignment_required_cd.id, reference_type: "given_partially")

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: false
    )

    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq cr
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_partially"
  end

  it "for a full given template " do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: assignment_required_cd.id, reference_type: "given_full")

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)


    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_full"


   expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: false
    )}.to raise_error(ArgumentError)


    expect(CodeResource.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
    expect(AssignmentRequiredCodeResource.first.template.reference_type).to eq "given_full"
  end

  it "wrong programming_language" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project, programming_language_id: block.default_programming_language.id, block_language_id: block.id)

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq block2.default_programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

  it "code resource in not from the project" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    project2 = create(:project)


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project2, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq block2.default_programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

  it "code resource no permissions" do
    owner = create(:user)
    user = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    project2 = create(:project)


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project2, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    mut = described_class.new(**init_args(user: user))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

  it "ids not existing" do
    owner = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    project2 = create(:project)


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project2, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: assignment_required_cd.id, 
        deep_copy: true
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil

    expect{ mut.resolve(
        assignment_required_code_resource_id: cr.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

  it "problems with code resource" do
    owner = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    project2 = create(:project)


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project2, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    allow(cr).to receive(:dup).and_raise('boom')

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

  it "problems with assignment required" do
    owner = create(:user)

    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)

    project = assignment.project
    project.block_languages = [ block, block2 ]
    project.user = owner
    project.save! 

    project2 = create(:project)


    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    
    cr = create(:code_resource, project: project2, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id)

    allow(assignment_required_cd).to receive(:save!).and_raise('boom')

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
        assignment_required_code_resource_id: assignment_required_cd.id,
        code_resource_id: cr.id, 
        deep_copy: true
    )}.to raise_error(ArgumentError)

    expect(CodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(AssignmentRequiredCodeResource.first.programming_language).to eq cr.programming_language
    expect(AssignmentRequiredCodeResource.first.solution).to eq nil
  end

end