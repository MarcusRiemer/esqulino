require 'rails_helper'

RSpec.describe Mutations::Projects::AcceptInvitation do
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

  it 'accept invitation normal work' do
    course = Project.find_by_slug_or_id!('course-test')

    participant = create(:user)
    course.project_members.create(user_id: participant.id, membership_type: 'participant')

    admin = create(:user)
    course.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      project_id: course.id
    )

    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).to eq nil

    mut = described_class.new(**init_args(user: admin))
    res = mut.resolve(
      project_id: course.id
    )

    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      project_id: group.id
    )

    expect(ProjectMember.count).to eq 4
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).to eq nil

    mut = described_class.new(**init_args(user: admin))
    res = mut.resolve(
      project_id: group.id
    )

    expect(ProjectMember.count).to eq 4
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    project = create(:project, slug: 'test')

    participant = create(:user)
    project.project_members.create(user_id: participant.id, membership_type: 'participant')

    admin = create(:user)
    project.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    res = mut.resolve(
      project_id: project.id
    )

    expect(ProjectMember.count).to eq 6
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).to eq nil

    mut = described_class.new(**init_args(user: admin))
    res = mut.resolve(
      project_id: project.id
    )

    expect(ProjectMember.count).to eq 6
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil
  end

  it 'not a member of the project' do
    course = Project.find_by_slug_or_id!('course-test')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        project_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    group = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        project_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    project = create(:project, slug: 'test')

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        project_id: project.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0
  end

  it 'accept invitation has already accepted' do
    course = Project.find_by_slug_or_id!('course-test')

    participant = create(:user)
    course.project_members.create(user_id: participant.id, membership_type: 'participant', joined_at: Date.today)

    admin = create(:user)
    course.project_members.create(user_id: admin.id, membership_type: 'admin', joined_at: Date.today)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        project_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        project_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant', joined_at: Date.today)

    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin', joined_at: Date.today)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        project_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 4
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        project_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 4
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    project = create(:project, slug: 'test')

    participant = create(:user)
    project.project_members.create(user_id: participant.id, membership_type: 'participant', joined_at: Date.today)

    admin = create(:user)
    project.project_members.create(user_id: admin.id, membership_type: 'admin', joined_at: Date.today)

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        project_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 6
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        project_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 6
    expect(ProjectMember.find_by(user_id: participant.id).joined_at).not_to eq nil
    expect(ProjectMember.find_by(user_id: admin.id).joined_at).not_to eq nil
  end

  it 'accept invitation as owner' do
    course = Project.find_by_slug_or_id!('course-test')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        project_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    group = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: group.user))
    expect do
      mut.resolve(
        project_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    project = create(:project, slug: 'test')

    mut = described_class.new(**init_args(user: project.user))
    expect do
      mut.resolve(
        project_id: project.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0
  end
end
