# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mutations::Projects::RemoveMember do
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

  it 'remove User role as owner in private group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: false)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 0
    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_owner))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 0
  end

  it 'remove User role as owner in public group' do
    current_user_owner = create(:user, display_name: 'Owner')
    project = create(:project, user: current_user_owner, public: true)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_owner))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 0
    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_owner))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: current_user_owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 0
  end

  it 'remove User role as admin in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user_user_admin = create(:user)
    project.project_members.create(user_id: current_user_user_admin.id, membership_type: 'admin')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 1
  end

  it 'remove User role as admin in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user_user_admin = create(:user)
    project.project_members.create(user_id: current_user_user_admin.id, membership_type: 'admin')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user.id
    )
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 1
  end

  it 'remove User role as participant in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: 'participant')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
  end

  it 'remove User role as participant in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: 'participant')

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
  end

  it 'remove User role as user in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
  end

  it 'remove User role as user in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_admin.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user_participant.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
  end

  it 'remove own User role in public group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: true)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user:))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: user_participant))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )

    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil
    expect(ProjectMember.count).to eq 0
  end

  it 'remove own User role in private group' do
    owner = create(:user, display_name: 'Owner')
    project = create(:project, user: owner, public: false)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: 'admin')

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user:))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: user.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect do
      mut.resolve(
        project_id: project.id,
        user_id: owner.id
      )
    end.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_admin))
    mut.resolve(
      project_id: project.id,
      user_id: user_admin.id
    )
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id)).to eq nil

    mut = described_class.new(**init_args(user: user_participant))
    mut.resolve(
      project_id: project.id,
      user_id: user_participant.id
    )

    expect(ProjectMember.find_by(user_id: user_participant.id)).to eq nil
    expect(ProjectMember.count).to eq 0
  end
end
