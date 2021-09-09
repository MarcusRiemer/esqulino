require 'rails_helper'

RSpec.describe Mutations::Projects::RemoveMemberFromParticipantGroup do
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

  it 'remove User from group as owner' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant1 = create(:user)
    group.project_members.create(user_id: participant1.id, membership_type: 'participant')
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id,
      user_id: participant.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id,
      user_id: participant1.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: participant1.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id,
      user_id: admin.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 0
    expect(ProjectMember.find_by(user_id: admin.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User from group as admin' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    course_admin = create(:user)
    course.project_members.create(user_id: course_admin.id, membership_type: 'participant')

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant1 = create(:user)
    group.project_members.create(user_id: participant1.id, membership_type: 'participant')
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: course_admin))
    res = mut.resolve(
      group_id: group.id,
      user_id: participant.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 7
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: participant.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: course_admin))
    res = mut.resolve(
      group_id: group.id,
      user_id: participant1.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 7
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant1.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1

    mut = described_class.new(**init_args(user: course_admin))
    res = mut.resolve(
      group_id: group.id,
      user_id: admin.id
    )

    expect(Project.count).to eq 2
    expect(User.count).to eq 7
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: admin.id)).to eq nil
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User from group with submissions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    assignment_submission = create(:assignment_submission, assignment: assignment, project_id: group.id)
    assignment_submitted_cd = create(:assignment_submitted_code_resource, assignment_required_code_resource_id: required.id, assignment_submission: assignment_submission)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: admin.id
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: group.id,
        user_id: participant.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User from group without permissions' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    user = create(:user)

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant1 = create(:user)
    group.project_members.create(user_id: participant1.id, membership_type: 'participant')
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 2
    expect(User.count).to eq 7
    expect(ProjectMember.count).to eq 3
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User which are not members' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    user = create(:user)

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant1 = create(:user)
    group.project_members.create(user_id: participant1.id, membership_type: 'participant')
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: group.user.id
      )
    end.to raise_error(ArgumentError)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: user.id
      )
    end.to raise_error(ArgumentError)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: course.user.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(User.count).to eq 7
    expect(ProjectMember.count).to eq 3
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User from project' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    project = create(:project)

    participant = create(:user)
    project.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    project.project_members.create(user_id: admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: project.id,
        user_id: admin.id
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: project.id,
        user_id: participant.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'remove User from course' do
    course = Project.find_by_slug_or_id!('course-test')
    block = course.block_languages.first

    participant = create(:user)
    course.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    course.project_members.create(user_id: admin.id, membership_type: 'admin')

    assignment = create(:assignment, project: course, end_date: (Date.today + 5))
    required = create(:assignment_required_code_resource, assignment: assignment, programming_language: block.default_programming_language)

    group = create(:project, based_on_project: course)
    participant_group = create(:user)
    group.project_members.create(user_id: participant_group.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: course.id,
        user_id: admin.id
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: course.id,
        user_id: participant.id
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: course.id,
        user_id: participant_group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(User.count).to eq 6
    expect(ProjectMember.count).to eq 3
    expect(ProjectCourseParticipation.count).to eq 1
  end
end
