require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentSubmission do

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

  it "create assignment submission normal work" do
    a = create(:assignment)

    project = create(:project, slug: nil)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )

    expect( AssignmentSubmission.count ).to eq 1
    expect(AssignmentSubmission.first.assignment_id).to eq a.id
    expect(AssignmentSubmission.first.project_id).to eq project.id
  end

  it "create assignment submission as member" do
    a = create(:assignment)

    project = create(:project, slug: nil)
    user= create(:user, display_name: "participant")
    project.project_members.create(user_id: user.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user))

    res = mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )

    expect( AssignmentSubmission.count ).to eq 1
    expect(AssignmentSubmission.first.assignment_id).to eq a.id
    expect(AssignmentSubmission.first.project_id).to eq project.id
  end

  it "create assignment submission for the  assignment project" do
    a = create(:assignment)

    mut = described_class.new(**init_args(user: a.project.user))

    res = mut.resolve(
        assignment_id: a.id,
        project_id:  a.project.id
    )

    expect( AssignmentSubmission.count ).to eq 1
    expect(AssignmentSubmission.first.assignment_id).to eq a.id
    expect(AssignmentSubmission.first.project_id).to eq a.project.id
  end

  it "create assignment submission as not a member" do
    a = create(:assignment)
    project = create(:project, slug: nil)

    user= create(:user, display_name: "user")

    mut = described_class.new(**init_args(user: user))

    expect{ mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentSubmission.count ).to eq 0
  end


  it "create assignment submission with wrong assignment_id" do
    a = create(:assignment)
    project = create(:project, slug: nil)

    mut = described_class.new(**init_args(user: project.user))

    expect{mut.resolve(
        assignment_id: "123131",
        project_id: project.id
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( AssignmentSubmission.count ).to eq 0

  end

end