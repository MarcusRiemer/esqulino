require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssigmentSubmissionGrade do

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

  it "create grade normal work" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    res = mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect( AssigmentSubmissionGrade.count ).to eq 1
    expect( AssigmentSubmissionGrade.first.feedback ).to eq "Feedback"
    expect( AssigmentSubmissionGrade.first.grade ).to eq 1
    expect( AssigmentSubmissionGrade.first.user.id ).to eq assigment_submission.assigment.project.user.id
    expect( AssigmentSubmissionGradeUser.count).to eq 2
    expect( AssigmentSubmissionGrade.first.assigment_submission_grade_users.count ).to eq 2
  end

  it "create grade with empty evaluted_people" do
    assigment_submission = create(:assigment_submission)

    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: []
    )}.to raise_error(ArgumentError)

    expect( AssigmentSubmissionGrade.count ).to eq 0
  end

  it "create grade without feedback" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    res = mut.resolve(
        assigment_submission_id: assigment_submission.id,
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect( AssigmentSubmissionGrade.count ).to eq 1
    expect( AssigmentSubmissionGrade.first.feedback ).to eq nil
    expect( AssigmentSubmissionGrade.first.grade ).to eq 1
    expect( AssigmentSubmissionGrade.first.user.id ).to eq assigment_submission.assigment.project.user.id
    expect( AssigmentSubmissionGradeUser.count).to eq 2
    expect( AssigmentSubmissionGrade.first.assigment_submission_grade_users.count ).to eq 2
  end

  it "create grade as admin" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    user_admin= create(:user, display_name: "admin")
    assigment_submission.assigment.project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    mut = described_class.new(**init_args(user: user_admin))

    res = mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect( AssigmentSubmissionGrade.count ).to eq 1
    expect( AssigmentSubmissionGrade.first.feedback ).to eq "Feedback"
    expect( AssigmentSubmissionGrade.first.grade ).to eq 1
    expect( AssigmentSubmissionGrade.first.user.id ).to eq user_admin.id
    expect( AssigmentSubmissionGradeUser.count).to eq 2
    expect( AssigmentSubmissionGrade.first.assigment_submission_grade_users.count ).to eq 2
  end

  it "create grade as member" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    user_participant= create(:user, display_name: "participant")
    assigment_submission.assigment.project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user_participant))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssigmentSubmissionGrade.count ).to eq 0
  end

  it "create grade as not a member of the project" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    user= create(:user, display_name: "evaluatedpeople2")

    mut = described_class.new(**init_args(user: user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssigmentSubmissionGrade.count ).to eq 0
  end

  it "create grade with not existing assigment submission" do

    user= create(:user, display_name: "user")
    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    
    mut = described_class.new(**init_args(user: user))

    expect{mut.resolve(
        assigment_submission_id: "1231231",
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( AssigmentSubmissionGrade.count ).to eq 0
  end

  it "create grade with one not existing evaluted_people" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, "111111212"]
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( AssigmentSubmissionGrade.count ).to eq 0
    expect( AssigmentSubmissionGradeUser.count).to eq 0
  end

  it "create grade with one evaluted_people which are not a member" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    
    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(ArgumentError)

    expect( AssigmentSubmissionGrade.count ).to eq 0
    expect( AssigmentSubmissionGradeUser.count).to eq 0
  end

  it "create grade with not existing grade value" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")
    
    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: -10,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(ArgumentError)

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 200,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(ArgumentError)

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 101,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )}.to raise_error(ArgumentError)

    expect( AssigmentSubmissionGrade.count ).to eq 0
    expect( AssigmentSubmissionGradeUser.count).to eq 0
  end

  it "create grade with double evaluted_people" do
    assigment_submission = create(:assigment_submission)

    evaluated_people1= create(:user, display_name: "evaluatedpeople1")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people1.id, membership_type: "participant")
    evaluated_people2= create(:user, display_name: "evaluatedpeople2")
    assigment_submission.assigment.project.project_members.create(user_id: evaluated_people2.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: assigment_submission.assigment.project.user))

    expect{mut.resolve(
        assigment_submission_id: assigment_submission.id,
        feedback: "Feedback",
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id, evaluated_people1.id]
    )}.to raise_error(ActiveRecord::RecordNotUnique)

    expect( AssigmentSubmissionGrade.count ).to eq 0
    expect( AssigmentSubmissionGradeUser.count).to eq 0
  end
end