# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mutations::Projects::ChangeOwner do
  # These specs relies on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  def init_args(user: User.guest)
    {
      context: {
        user:
      },
      object: nil,
      field: nil
    }
  end

  it 'change owner as owner in private group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id
    )
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq current_user_owner
  end

  it 'change owner as owner in public group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id
    )
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq current_user_owner
  end

  it 'change admin as owner in public group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user_admin
  end

  it 'change admin as owner in private group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user_admin
  end

  it 'change participant as owner in public group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user_participant
  end

  it 'change participant as owner in private group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user_participant
  end

  it 'change user as owner in public group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user
  end

  it 'change user as owner in private group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: current_user_owner.id).user).to eq current_user_owner
    expect(Project.first.user).to eq user
  end

  it 'change owner as admin in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: 'admin')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner
  end

  it 'change owner as admin in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: 'admin')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner
  end

  it 'change owner as participant in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: 'participant')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner
  end

  it 'change owner as participant in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: 'participant')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect(Project.first.user).to eq owner
  end

  it 'change owner as user in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner
  end

  it 'change owner as user in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner

    # Selfe
    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect(Project.first.user).to eq owner
  end
end
