require "rails_helper"

RSpec.describe Mutations::Projects::UpdateAssignmentRequiredCodeResource do

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

  it "create assignment required code resource  -  normal work" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", resource_type: ".txt", description:"Beschreibung")


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment_required_cd.id,
      name: "Anforderung",
      description:  "Erklaerung"
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Anforderung"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "Erklaerung"


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment_required_cd.id,
      name: "Anforderung 3",
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Anforderung 3"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "Erklaerung"


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment_required_cd.id,
      description:  "test"
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Anforderung 3"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "test"

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment_required_cd.id,
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Anforderung 3"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "test"

  end

  it "create assignment required code resource  - change empty name" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", resource_type: ".txt", description:"Beschreibung")


    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      id: assignment_required_cd.id,
      name: ""
    )}.to raise_error(ActiveRecord::RecordInvalid)

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "Beschreibung"
  end
      

  it "create assignment required code resource  - change description to blank" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", resource_type: ".txt", description:"Beschreibung")


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment_required_cd.id,
      description: ""
    )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq nil

    res = mut.resolve(
        id: assignment_required_cd.id,
        description: "   "
      )

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq nil
  end

  it "create assignment required code resource - without permissions" do
    current_user_owner = create(:user, display_name: "Owner")
    user = create(:user)
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    assignment = create(:assignment, project_id: project.id)
    assignment_required_cd = create(:assignment_required_code_resource, assignment_id: assignment.id, name: "Test", resource_type: ".txt", description:"Beschreibung")


    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      id: assignment_required_cd.id,
      name: "Anforderung",
      description:  "Erklaerung"
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentRequiredCodeResource.count ).to eq 1
    expect( AssignmentRequiredCodeResource.first.id).to eq assignment_required_cd.id
    expect( AssignmentRequiredCodeResource.first.name).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.description).to eq "Beschreibung"
  end

end