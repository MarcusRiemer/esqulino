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
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant", based_on_project: based_on_project)

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
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant", based_on_project: based_on_project)


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

  it "create assignment submission as the based course" do
    project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: project.id)

    mut = described_class.new(**init_args(user: project.user))

    expect{mut.resolve(
        assignment_id: a.id,
        project_id:  project.id
    )}.to raise_error(ArgumentError)

    expect( AssignmentSubmission.count ).to eq 0
  end

  it "create assignment submission as not a member" do
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant", based_on_project: based_on_project)


    user= create(:user, display_name: "user")

    mut = described_class.new(**init_args(user: user))

    expect{ mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentSubmission.count ).to eq 0
  end


  it "create assignment submission with wrong assignment_id" do
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant", based_on_project: based_on_project)


    mut = described_class.new(**init_args(user: project.user))

    expect{mut.resolve(
        assignment_id: "123131",
        project_id: project.id
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( AssignmentSubmission.count ).to eq 0

  end


  it "create assignment submission -  2 times from on project to the same assignment" do
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant", based_on_project: based_on_project)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )

    expect( AssignmentSubmission.count ).to eq 1
    expect(AssignmentSubmission.first.assignment_id).to eq a.id
    expect(AssignmentSubmission.first.project_id).to eq project.id

    expect{mut.resolve(
      assignment_id: a.id,
      project_id: project.id
    )}.to raise_error(ActiveRecord::RecordNotUnique)

  end

  it "create assignment submission as not a  course of the course which  have the assignment" do
    based_on_project = create(:project, slug: "course-based")
    a = create(:assignment, project_id: based_on_project.id)

    project = create(:project, slug: "course-participant")

    mut = described_class.new(**init_args(user: project.user))

    expect{mut.resolve(
        assignment_id: a.id,
        project_id: project.id
    )}.to raise_error(ArgumentError)

    expect( AssignmentSubmission.count ).to eq 0


    other_based_on_project = create(:project, slug: "course-other-based")  
    project = create(:project, slug: "course-participants", based_on_project: other_based_on_project)

  expect{mut.resolve(
      assignment_id: a.id,
      project_id: project.id
  )}.to raise_error(ActiveRecord::RecordNotFound)

  expect( AssignmentSubmission.count ).to eq 0

  end

end