#require "rails_helper"

RSpec.describe Mutations::Projects::DestroyAssignmentRequiredCodeResource do

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

  it "destroy assignment_required_code_resource normal work" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")
    
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    project.block_languages = [ block, block2, block3 ]

    project.save!

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block.default_programming_language, description:"Beschreibung")

    
    expect( AssignmentRequiredCodeResource.count ).to eq 1

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
        id: assignment_required_cd.id
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 0
  end

  it "destroy assignment_required_code_resource with templates" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    project.block_languages = [ block, block2, block3 ]

    project.save!

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block2.default_programming_language, description:"Beschreibung")
    


    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: assignment_required_cd.id)
    
    expect( CodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count ).to eq 1

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
        id: assignment_required_cd.id
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 0
    expect( CodeResource.count ).to eq 1
  end

  it "destroy assignment_required_code_resource without permissions" do
    current_user_owner = create(:user, display_name: "Owner")
    user = create(:user)
    
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    project.block_languages = [ block, block2, block3 ]

    project.save!

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block3.default_programming_language, description:"Beschreibung")

    
    expect( AssignmentRequiredCodeResource.count ).to eq 1

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
        id: assignment_required_cd.id
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentRequiredCodeResource.count ).to eq 1

  end

  it "destroy assignment_required_code_resource can´t delete if there is a submitted_code_resource" do
    current_user_owner = create(:user, display_name: "Owner")
    
    project = create(:project, user: current_user_owner, public: false, slug:"course")
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    
    project.block_languages = [ block, block2, block3 ]

    project.save!

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", programming_language: block.default_programming_language, description:"Beschreibung")

    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: assignment_required_cd.id )
    
    expect( AssignmentRequiredCodeResource.count ).to eq 1

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
        id: assignment_required_cd.id
    )}.to raise_error(ActiveRecord::InvalidForeignKey)

    expect( AssignmentRequiredCodeResource.count ).to eq 1


    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: assignment_required_cd.id)
    expect( AssignmentTemplateCodeResource.count ).to eq 1

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
        id: assignment_required_cd.id
    )}.to raise_error(ActiveRecord::InvalidForeignKey)

    expect( AssignmentTemplateCodeResource.count ).to eq 1
  end
end