require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignment do

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
    
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      description: "Test",
      start_date:  date,
      end_date: date_later
    )



    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 1"
    expect( Assignment.first.description).to eq "Test"
    expect( Assignment.first.start_date).to eq date
    expect( Assignment.first.end_date).to eq date_later

  end

  it "create assignment without description, start_date and end_date" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date_now = DateTime.now

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 1"
    expect( Assignment.first.description).to eq nil
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq nil
  end

  it "create assignment as not a member of the project" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    date_now = DateTime.now

    mut = described_class.new(**init_args())
    expect{mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( Assignment.count ).to eq 0
  end

  it "create assingment as not admin or owner" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    user = create(:user)
    project.project_members.create(user_id: user.id, membership_type: "participant")

    date_now = DateTime.now

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( Assignment.count ).to eq 0
  end


  it "create assignment as project" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"test")

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
    )}.to raise_error(ArgumentError)

    expect( Assignment.count ).to eq 0
  end

  it "create assignment as admin" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")

    user = create(:user)
    project.project_members.create(user_id: user.id, membership_type: "admin")

    date_now = DateTime.now

    mut = described_class.new(**init_args(user: user))
    res = mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
    )

    expect( Assignment.count ).to eq 1
    expect( Assignment.first.name).to eq "Aufgabe 1"
    expect( Assignment.first.description).to eq nil
    expect( Assignment.first.start_date).to eq nil
    expect( Assignment.first.end_date).to eq nil
  end

  it "create assignment end_date is behind the start_date" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false, slug:"course")
    mut = described_class.new(**init_args(user: current_user_owner))


    #hours
    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,1,1,6)

    expect {mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      start_date:  date_later,
      end_date: date
    )}.to raise_error(ArgumentError)

    #days
    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,1,2,5)

    expect {mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      start_date:  date_later,
      end_date: date
    )}.to raise_error(ArgumentError)

    #months
    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,2,1,5)

    expect {mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      start_date:  date_later,
      end_date: date
    )}.to raise_error(ArgumentError)

    #years
    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2001,1,1,5)

    expect {mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      start_date:  date_later,
      end_date: date
    )}.to raise_error(ArgumentError)

    #same
    date = DateTime.new(2000,1,1,5)
    date_later = DateTime.new(2000,1,1,5)

    expect {mut.resolve(
      project_id: project.id,
      name: "Aufgabe 1",
      start_date:  date_later,
      end_date: date
    )}.to raise_error(ArgumentError)
  end

  it "create assignment the project is not existing" do
    user = create(:user, display_name: "Owner")

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: "1321",
      name: "Aufgabe 1",
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( Assignment.count ).to eq 0
  end
end