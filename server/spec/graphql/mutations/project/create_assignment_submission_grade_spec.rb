require 'rails_helper'

RSpec.describe Mutations::Projects::CreateAssignmentSubmissionGrade do
  # These specs relies on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil
    }
  end

  it 'create grade normal work' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Feedback',
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq 'Feedback'
    expect(AssignmentSubmissionGrade.first.grade).to eq 1
    expect(AssignmentSubmissionGrade.first.user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 2

    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      grade: 2,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect(AssignmentSubmissionGradeUser.count).to eq 4
    expect(AssignmentSubmissionGrade.count).to eq 2

    expect(AssignmentSubmission.find(assignment_submission.id).assignment_submission_grades.first.grade).to eq 2
    expect(AssignmentSubmission.find(assignment_submission.id).assignment_submission_grades.first.feedback).to eq nil
    expect(AssignmentSubmission.find(assignment_submission.id).assignment_submission_grades.first.user.id).to eq assignment_submission.assignment.project.user.id
  end

  it 'create grade with empty evaluted_people' do
    assignment_submission = create(:assignment_submission)

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: []
      )
    end.to raise_error(ArgumentError)

    expect(AssignmentSubmissionGrade.count).to eq 0
  end

  it 'create grade without feedback' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq nil
    expect(AssignmentSubmissionGrade.first.grade).to eq 1
    expect(AssignmentSubmissionGrade.first.user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 2
  end

  it 'create grade as admin' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    user_admin = create(:user, display_name: 'admin')
    assignment_submission.assignment.project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: user_admin))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Feedback',
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq 'Feedback'
    expect(AssignmentSubmissionGrade.first.grade).to eq 1
    expect(AssignmentSubmissionGrade.first.user.id).to eq user_admin.id
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 2
  end

  it 'create grade as member of the group' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    user_participant = create(:user, display_name: 'participant')
    assignment_submission.project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: user_participant))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(AssignmentSubmissionGrade.count).to eq 0
  end

  it 'create grade as not a member of the project' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    user = create(:user, display_name: 'evaluatedpeople2')

    mut = described_class.new(**init_args(user: user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(AssignmentSubmissionGrade.count).to eq 0
  end

  it 'create grade with not existing assignment submission' do
    user = create(:user, display_name: 'user')
    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')

    mut = described_class.new(**init_args(user: user))

    expect do
      mut.resolve(
        assignment_submission_id: '1231231',
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ActiveRecord::RecordNotFound)

    expect(AssignmentSubmissionGradeUser.count).to eq 0
    expect(AssignmentSubmissionGrade.count).to eq 0
  end

  it 'create grade with one not existing evaluted_people' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, '111111212']
      )
    end.to raise_error(ActiveRecord::RecordNotFound)

    expect(AssignmentSubmissionGrade.count).to eq 0
    expect(AssignmentSubmissionGradeUser.count).to eq 0
  end

  it 'create grade with one evaluted_people which are not a member' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ArgumentError)

    expect(AssignmentSubmissionGrade.count).to eq 0
    expect(AssignmentSubmissionGradeUser.count).to eq 0
  end

  it 'create grade with not existing grade value' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: -10,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ActiveRecord::RecordInvalid)

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 200,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ActiveRecord::RecordInvalid)

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 101,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ActiveRecord::RecordInvalid)

    expect(AssignmentSubmissionGrade.count).to eq 0
    expect(AssignmentSubmissionGradeUser.count).to eq 0
  end

  it 'create grade with double evaluted_people' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))


      res = mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id, evaluated_people1.id]
      )


    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(User.find(evaluated_people1.id).grades.count).to eq 1
    expect(User.find(evaluated_people2.id).grades.count).to eq 1


    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Feedback',
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id, evaluated_people1.id]
    )


  expect(AssignmentSubmissionGrade.count).to eq 1
  expect(AssignmentSubmissionGradeUser.count).to eq 2
  expect(User.find(evaluated_people1.id).grades.count).to eq 1
  expect(User.find(evaluated_people2.id).grades.count).to eq 1

  end

  it 'create grade with one evaluted_people which are a member of a other project' do
    project = create(:project)

    assignment_submission = create(:assignment_submission)
    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.assignment.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')

    assignment_submission2 = create(:assignment_submission, assignment_id: assignment_submission.assignment.id, project_id: project.id)
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    expect do
      mut.resolve(
        assignment_submission_id: assignment_submission.id,
        feedback: 'Feedback',
        grade: 1,
        evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
      )
    end.to raise_error(ArgumentError)

    expect(AssignmentSubmissionGrade.count).to eq 0
    expect(AssignmentSubmissionGradeUser.count).to eq 0
  end

  it 'create grade with problems' do
    # TODO: Möglich ?
  end

  it 'create new grade for a already existing grade' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Feedback',
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq 'Feedback'
    expect(AssignmentSubmissionGrade.first.grade).to eq 1
    expect(AssignmentSubmissionGrade.first.user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 2

    grade = AssignmentSubmissionGrade.first

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'okay',
      grade: 10,
      evaluted_people_ids: [evaluated_people2.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 2
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect(AssignmentSubmissionGrade.find(grade.id).assignment_submission_grade_users.count).to eq 1
    expect(AssignmentSubmissionGrade.find(grade.id).assignment_submission_grade_users.first.user).to eq evaluated_people1
    expect(AssignmentSubmission.find(assignment_submission.id).assignment_submission_grades.count).to eq 2

    expect(AssignmentSubmissionGrade.find_by(grade: 10).feedback).to eq 'okay'
    expect(AssignmentSubmissionGrade.find_by(grade: 10).assignment_submission_grade_users.first.user).to eq evaluated_people2
    expect(AssignmentSubmissionGrade.find_by(grade: 10).assignment_submission_grade_users.count).to eq 1

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'test',
      grade: 100,
      evaluted_people_ids: [evaluated_people1.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 2
    expect(AssignmentSubmissionGradeUser.count).to eq 2
    expect { AssignmentSubmissionGrade.find(grade.id) }.to raise_error(ActiveRecord::RecordNotFound)
    expect(AssignmentSubmissionGrade.find_by(grade: 100).feedback).to eq 'test'
    expect(AssignmentSubmissionGrade.find_by(grade: 100).assignment_submission_grade_users.first.user).to eq evaluated_people1
    expect(AssignmentSubmissionGrade.find_by(grade: 100).assignment_submission_grade_users.count).to eq 1
  end

  it 'create new grade for a already existing grade with more than one user' do
    assignment_submission = create(:assignment_submission)

    evaluated_people1 = create(:user, display_name: 'evaluatedpeople1')
    assignment_submission.project.project_members.create(user_id: evaluated_people1.id, membership_type: 'participant')
    evaluated_people2 = create(:user, display_name: 'evaluatedpeople2')
    assignment_submission.project.project_members.create(user_id: evaluated_people2.id, membership_type: 'participant')
    evaluated_people3 = create(:user, display_name: 'evaluatedpeople3')
    assignment_submission.project.project_members.create(user_id: evaluated_people3.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: assignment_submission.assignment.project.user))

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Feedback',
      grade: 1,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id, evaluated_people3.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq 'Feedback'
    expect(AssignmentSubmissionGrade.first.grade).to eq 1
    expect(AssignmentSubmissionGrade.first.user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGradeUser.count).to eq 3
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 3

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'okay',
      grade: 10,
      evaluted_people_ids: [evaluated_people1.id, evaluated_people2.id, evaluated_people3.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 1
    expect(AssignmentSubmissionGrade.first.feedback).to eq 'okay'
    expect(AssignmentSubmissionGrade.first.grade).to eq 10
    expect(AssignmentSubmissionGrade.first.user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGradeUser.count).to eq 3
    expect(AssignmentSubmissionGrade.first.assignment_submission_grade_users.count).to eq 3

    res = mut.resolve(
      assignment_submission_id: assignment_submission.id,
      feedback: 'Test',
      grade: 100,
      evaluted_people_ids: [evaluated_people2.id, evaluated_people3.id]
    )

    expect(AssignmentSubmissionGrade.count).to eq 2
    expect(AssignmentSubmissionGrade.find_by(grade: 100).feedback).to eq 'Test'
    expect(AssignmentSubmissionGrade.find_by(grade: 100).user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGrade.find_by(grade: 100).assignment_submission_grade_users.count).to eq 2

    expect(AssignmentSubmissionGrade.find_by(grade: 10).feedback).to eq 'okay'
    expect(AssignmentSubmissionGrade.find_by(grade: 10).user.id).to eq assignment_submission.assignment.project.user.id
    expect(AssignmentSubmissionGrade.find_by(grade: 10).assignment_submission_grade_users.count).to eq 1

    expect(AssignmentSubmissionGradeUser.count).to eq 3
  end
end
