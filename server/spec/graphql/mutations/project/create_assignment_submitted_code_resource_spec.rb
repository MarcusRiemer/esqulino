require 'rails_helper'

RSpec.describe Mutations::Projects::CreateAssignmentSubmittedCodeResource do
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

  it 'create a submission to a requirement which is a required code resource' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.assignment.id).to eq assignment.id
    expect(AssignmentSubmittedCodeResource.first.code_resource.block_language.id).to eq block.id
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.project.id).to eq group.id

    block2 = course.block_languages.last

    assignment = create(:assignment, project: course)
    required2 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)
    required3 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)
    required4 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required3.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 2
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 2

    assignment_submission = AssignmentRequiredCodeResource.find(required3.id).assignment_submitted_code_resources.first.assignment_submission

    expect(AssignmentRequiredCodeResource.find(required3.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required3.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq group.id
    expect(AssignmentRequiredCodeResource.find(required3.id).assignment_submitted_code_resources.first.code_resource.block_language.id).to eq block.id

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required4.id,
      group_id: group.id,
      block_language_id: block2.id
    )
    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 3
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 3
    # Same Submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission).to eq assignment_submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq group.id
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.block_language).to eq block2
  end

  it 'create a submission to a requirement which is a required code resource with not allowed block_language' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first
    block2 = course.block_languages.last

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id,
        block_language_id: block2.id
      )
    end.to raise_error(ArgumentError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create a submission to a requirement which is a required code resourcewith a not existing  block_language' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id,
        block_language_id: '1231'
      )
    end.to raise_error(ActiveRecord::RecordNotFound)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create a submission to a requirement which is a required code resource without block_language' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create template given_full code resource' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)
    code_resource = create(:code_resource, programming_language_id: block.default_programming_language.id, block_language_id: block.id, project: course)
    template = create(:assignment_template_code_resource, reference_type: 'given_full', code_resource: code_resource, assignment_required_code_resource_id: required.id)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.assignment.id).to eq assignment.id
    expect(AssignmentSubmittedCodeResource.first.code_resource.block_language.id).to eq block.id
    expect(AssignmentSubmittedCodeResource.first.code_resource).to eq code_resource
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.project.id).to eq group.id

    block2 = course.block_languages.last

    assignment = create(:assignment, project: course)

    required2 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)
    code_resource2 = create(:code_resource, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id, project: course)
    template2 = create(:assignment_template_code_resource, reference_type: 'given_full', code_resource: code_resource2, assignment_required_code_resource_id: required2.id)

    required3 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    required4 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)
    code_resource3 = create(:code_resource, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id, project: course)
    template3 = create(:assignment_template_code_resource, reference_type: 'given_full', code_resource: code_resource3, assignment_required_code_resource_id: required4.id)

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required2.id,
      group_id: group.id,
      block_language_id: block2.id
    )

    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 3
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 2

    assignment_submission = AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.assignment_submission

    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq course.id
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource).to eq code_resource2
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource.block_language.id).to eq block2.id

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required4.id,
      group_id: group.id,
      block_language_id: block2.id
    )
    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 3
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 3
    # Same Submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission).to eq assignment_submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq course.id
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource).to eq code_resource3
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.block_language).to eq block2
  end

  it 'create template given partially code resource' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)
    code_resource = create(:code_resource, programming_language_id: block.default_programming_language.id, block_language_id: block.id, project: course)
    template = create(:assignment_template_code_resource, reference_type: 'given_partially', code_resource: code_resource, assignment_required_code_resource_id: required.id)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 2
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.assignment.id).to eq assignment.id
    expect(AssignmentSubmittedCodeResource.first.code_resource.block_language.id).to eq block.id
    expect(AssignmentSubmittedCodeResource.first.code_resource.compiled).to eq code_resource.compiled
    expect(AssignmentSubmittedCodeResource.first.assignment_submission.project.id).to eq group.id

    block2 = course.block_languages.last

    assignment = create(:assignment, project: course)

    required2 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)
    code_resource2 = create(:code_resource, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id, project: course)
    template2 = create(:assignment_template_code_resource, reference_type: 'given_partially', code_resource: code_resource2, assignment_required_code_resource_id: required2.id)

    required3 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    required4 = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block2.default_programming_language)
    code_resource3 = create(:code_resource, programming_language_id: block2.default_programming_language.id, block_language_id: block2.id, project: course)
    template3 = create(:assignment_template_code_resource, reference_type: 'given_partially', code_resource: code_resource3, assignment_required_code_resource_id: required4.id)

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required2.id,
      group_id: group.id,
      block_language_id: block2.id
    )

    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 5
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 2

    assignment_submission = AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.assignment_submission

    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq group.id
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource.compiled).to eq code_resource2.compiled
    expect(AssignmentRequiredCodeResource.find(required2.id).assignment_submitted_code_resources.first.code_resource.block_language.id).to eq block2.id

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required4.id,
      group_id: group.id,
      block_language_id: block2.id
    )
    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 4
    expect(CodeResource.count).to eq 6
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 3
    # Same Submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission).to eq assignment_submission
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.assignment_submission.assignment).to eq assignment
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.project.id).to eq group.id
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.compiled).to eq code_resource3.compiled
    expect(AssignmentRequiredCodeResource.find(required4.id).assignment_submitted_code_resources.first.code_resource.block_language).to eq block2
  end

  it 'create  submitted code resource without permissions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: group.user))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id,
        block_language_id: block.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id,
        block_language_id: block.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create submitted code resource for a project which are not a group of the course' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    project = create(:project)
    participant = create(:user)
    project.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: project.id,
        block_language_id: block.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create submitted code resource with a not existing group_id' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: '1231',
        block_language_id: block.id
      )
    end.to raise_error(ActiveRecord::RecordNotFound)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'create submitted code resource with a not existing required_code_resource_id' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        required_code_resource_id: 'asdas',
        group_id: group.id,
        block_language_id: block.id
      )
    end.to raise_error(ActiveRecord::RecordNotFound)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 0
    expect(AssignmentSubmission.count).to eq 0
    expect(AssignmentSubmittedCodeResource.count).to eq 0
  end

  it 'dont copy the solutions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    code_resource = create(:code_resource, programming_language_id: block.default_programming_language.id, block_language_id: block.id, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language, solution: code_resource)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 2
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
    expect(AssignmentSubmittedCodeResource.first.code_resource).not_to eq code_resource

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language, solution: code_resource)
    code_resource1 = create(:code_resource, programming_language_id: block.default_programming_language.id, block_language_id: block.id, project: course)
    template = create(:assignment_template_code_resource, reference_type: 'given_partially', code_resource: code_resource1, assignment_required_code_resource_id: required.id)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect(Assignment.count).to eq 2
    expect(AssignmentRequiredCodeResource.count).to eq 2
    expect(CodeResource.count).to eq 4
    expect(AssignmentSubmission.count).to eq 2
    expect(AssignmentSubmittedCodeResource.count).to eq 2
  end

  it 'correct restoration of the old state in case of problems' do
    # TODO: Überhaubt möglich
  end

  it 'create a submitted code resource for an already submitted code resource to a requirement ' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course)
    required = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      required_code_resource_id: required.id,
      group_id: group.id,
      block_language_id: block.id
    )

    expect do
      mut.resolve(
        required_code_resource_id: required.id,
        group_id: group.id,
        block_language_id: block.id
      )
    end.to raise_error(ArgumentError)

    expect(Assignment.count).to eq 1
    expect(AssignmentRequiredCodeResource.count).to eq 1
    expect(CodeResource.count).to eq 1
    expect(AssignmentSubmission.count).to eq 1
    expect(AssignmentSubmittedCodeResource.count).to eq 1
  end
end
