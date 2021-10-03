require 'rails_helper'

RSpec.describe Mutations::Projects::DestroyAssignmentSubmittedCodeResource do
  # These specs relies on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
    course = create(:project, slug: 'course-test')
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)

    course.block_languages = [block, block2, block3]
    course.save!
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

  it 'destroy assignment normal work' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      assignment_submitted_code_resource_id: assignment_submitted_cd.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'destroy assignment with nil end_date' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: nil)
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      assignment_submitted_code_resource_id: assignment_submitted_cd.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'destroy assignment without permissions' do
    user = create(:user)

    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: nil)
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        assignment_submitted_code_resource_id: assignment_submitted_cd.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
  end

  it 'destroy assignment the delivery date has passed ' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today - 3))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        assignment_submitted_code_resource_id: assignment_submitted_cd.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
  end

  it 'normal work with given_partially code resource' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)
    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: required.id)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 2
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      assignment_submitted_code_resource_id: assignment_submitted_cd.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'dont destroy a full given template code resource' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: nil)
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)
    assignment_template_cd = create(:assignment_template_code_resource, assignment_required_code_resource_id: required.id, reference_type: 'given_full')

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission, code_resource: assignment_template_cd.code_resource)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      assignment_submitted_code_resource_id: assignment_submitted_cd.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end
end
