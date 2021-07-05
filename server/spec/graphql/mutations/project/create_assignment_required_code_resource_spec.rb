require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredCodeResource do

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

  it "create assignment normal work" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)
    

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      resource_type:  ".txt"
    )



    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.description).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.name).to eq "Aufgabe 1"
  end

  it "create assignment required code resource no permissions" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    user = create(:user)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)
    

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      resource_type:  ".txt"
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentRequiredCodeResource.count ).to eq 0
  end

 it "create assignment required code resource with empty description" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)
    

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "",
      resource_type:  ".txt"
    )

    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.description).to eq nil
    expect( AssignmentRequiredCodeResource.first.resource_type).to eq ".txt"
    expect( AssignmentRequiredCodeResource.first.name).to eq "Aufgabe 1"
  end


  it "create assignment required code resource with empty name" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)
    

    mut = described_class.new(**init_args(user: current_user_owner))

    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "",
      description: "Test",
      resource_type:  ".txt"
    )}.to raise_error(ActiveRecord::RecordInvalid)

    expect( AssignmentRequiredCodeResource.count ).to eq 0  
end

  it "create assignment required code resource with empty resource_type" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)
    

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      resource_type:  ""
    )}.to raise_error(ActiveRecord::RecordInvalid)

    expect( AssignmentRequiredCodeResource.count ).to eq 0  
    end

end