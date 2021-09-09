require 'rails_helper'

RSpec.describe Mutations::Projects::AddMemberToGroup do
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

  it 'add member normal work ' do
    course = create(:project, slug: 'course-test')
    group = create(:project, based_on_project: course)

    participant = create(:user)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id,
      user_id: participant.id,
      role: 'participant'
    )

    expect(ProjectMember.find_by(user_id: participant.id).membership_type).to eq 'participant'
    expect(ProjectMember.find_by(user_id: participant.id).user).to eq participant
    expect(ProjectMember.find_by(user_id: participant.id).project).to eq group

    admin = create(:user)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      group_id: group.id,
      user_id: admin.id,
      role: 'admin'
    )

    expect(ProjectMember.find_by(user_id: admin.id).membership_type).to eq 'admin'
    expect(ProjectMember.find_by(user_id: admin.id).user).to eq admin
    expect(ProjectMember.find_by(user_id: admin.id).project).to eq group
  end

  it 'add member which is already a member' do
    course = create(:project, slug: 'course-test')

    participant = create(:user)
    admin = create(:user)
    group = create(:project, based_on_project: course)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    group2 = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: participant.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: participant.id,
        role: 'admin'
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: admin.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)

    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: admin.id,
        role: 'admin'
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it 'add member which is a  participant of the course' do
    course = create(:project, slug: 'course-test')

    participant = create(:user)
    admin = create(:user)
    course.project_members.create(user_id: participant.id, membership_type: 'participant')
    course.project_members.create(user_id: admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course)

    group2 = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: course.user.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: admin.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group2.id,
        user_id: participant.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)
  end

  it 'add member without permissions' do
    course = create(:project, slug: 'course-test')

    user = create(:user)

    participant = create(:user)
    admin = create(:user)

    group = create(:project, based_on_project: course)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: course.user.id,
        role: 'participant'
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: course.user.id,
        role: 'participant'
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        group_id: group.id,
        user_id: course.user.id,
        role: 'participant'
      )
    end.to raise_error(Pundit::NotAuthorizedError)
  end

  it 'add a member which is not a course' do
    project = create(:project, slug: 'test')

    user = create(:user)

    mut = described_class.new(**init_args(user: project.user))
    expect do
      mut.resolve(
        group_id: project.id,
        user_id: user.id,
        role: 'participant'
      )
    end.to raise_error(ArgumentError)
  end
end
