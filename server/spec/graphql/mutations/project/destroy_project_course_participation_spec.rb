require 'rails_helper'

RSpec.describe Mutations::Projects::DestroyProjectCourseParticipation do
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

  it 'destroy participant course normal work' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    expect(Project.count).to eq 2

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    group = create(:project, based_on_project: course)
    participant2 = create(:user)
    participant3 = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    group.project_members.create(user_id: participant2.id, membership_type: 'participant')
    group.project_members.create(user_id: participant3.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    group = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'destroy participant course without permissions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'destroy participant course with submissions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    expect(Project.count).to eq 3

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'destroy project' do
    project = create(:project)

    mut = described_class.new(**init_args(user: project.user))
    expect do
      mut.resolve(
        group_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
  end

  it 'destroy the course' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: course.id
      )
    end.to raise_error(ArgumentError)
    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: course.id
      )
    end.to raise_error(ArgumentError)
    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 1
  end
end
