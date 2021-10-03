require "rails_helper"

RSpec.describe Mutations::Projects::UpdateAssignment do

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

  it "change assignment normal work" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    assignment = create(:assignment, project_id: project.id)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)
    
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      name: "Aufgabe 10",
      description: "Ein weiterer Test",
      start_date:  date,
      end_date: date_later,
      weight: 3
    )



    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 10"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      name: "Aufgabe Y",
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe Y"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq nil
    expect( Assignment.first.weight).to eq 3

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      description: "Test",
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe Y"
    expect( Assignment.first.description).to eq "Test"
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq nil
    expect( Assignment.first.weight).to eq 3


    date = DateTime.new(2000,2,1,5)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      start_date: date
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe Y"
    expect( Assignment.first.description).to eq "Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq nil
    expect( Assignment.first.weight).to eq 3

    date_later = DateTime.new(2001,2,1,7)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      end_date: date_later
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe Y"
    expect( Assignment.first.description).to eq "Test"
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      id: assignment.id,
      weight: 10
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe Y"
    expect( Assignment.first.description).to eq "Test"
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq nil
    expect( Assignment.first.weight).to eq 10

  end

  it "change assignment with empty name" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)

  
    
    mut = described_class.new(**init_args(user: current_user_owner))
    expect{ mut.resolve(
      id: assignment.id,
      name: "",
    )}.to raise_error(ActiveRecord::RecordInvalid)



    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 10"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3
  end

  it "change assignment with negativ weight" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)

  
    
    mut = described_class.new(**init_args(user: current_user_owner))
    expect{ mut.resolve(
      id: assignment.id,
      weight: -10,
    )}.to raise_error(ActiveRecord::RecordInvalid)

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 10"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3
  end

  it "change assignment with higher start_date as end_date" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)

    date1 = DateTime.new(1997,2,1,5)
    date2 = DateTime.new(1997,1,1,5)

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{ mut.resolve(
      id: assignment.id,
      start_date: date1,
      end_date: date2
    )}.to raise_error(ArgumentError)

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 10"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3
  end


  it "change assignment without permissions" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user = create(:user)

    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,3,6,5)

    assignment = create(:assignment, project_id: project.id, name: "Aufgabe 10", description: "Ein weiterer Test", start_date: date, end_date: date_later, weight: 3)

  
    
    mut = described_class.new(**init_args(user: user))
    expect{ mut.resolve(
      id: assignment.id,
      name: "",
    )}.to raise_error(Pundit::NotAuthorizedError)



    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 10"
    expect( Assignment.first.description).to eq "Ein weiterer Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later
    expect( Assignment.first.weight).to eq 3
  end


end