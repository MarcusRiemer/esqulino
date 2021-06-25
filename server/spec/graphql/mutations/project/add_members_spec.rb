require "rails_helper"

RSpec.describe Mutations::Projects::AddMembers do

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

  it "add User as owner in public project" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    )
    expect(ProjectMember.count).to eq 1
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    )

    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [current_user_owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [current_user_owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

  end

  it "add User as owner in private project" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    )
    expect(ProjectMember.count).to eq 1
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    )

    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [current_user_owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [current_user_owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

  end

  it "add User as admin in public project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    )
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    )

    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

  end

  it "add User as admin in private project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    )
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    )

    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

  end

  it "add User as participant in public project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_participant = create(:user, display_name: "test")
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 1


    mut = described_class.new(**init_args(user: current_user_participant))
    res = mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    )

    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add User as participant in private project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_participant = create(:user, display_name: "test")
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 1


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 1

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 1

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 1
  end

  it "add User as normal_user in private project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    normal_user = create(:user)

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 0


    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 0

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0
  end

  it "add User as normal_user in public project" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    normal_user = create(:user)

    user_admin = create(:user)

    user_participant = create(:user)

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 0


    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    ) }.to raise_error Pundit::NotAuthorizedError

    expect(ProjectMember.count).to eq 0

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0

    mut = described_class.new(**init_args(user: normal_user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 0
  end

  it "add same User in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add same User in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_admin.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user_participant.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [owner.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add some Users as owner" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: owner))
    mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user1.id,user2.id],
      is_admin: true
    )
    expect(ProjectMember.find_by(user_id: user1).membership_type).to eq "admin"
    expect(ProjectMember.count).to eq 5

    mut = described_class.new(**init_args(user: owner))
    mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )
    expect(ProjectMember.find_by(user_id: user3).membership_type).to eq "participant"
    expect(ProjectMember.count).to eq 8
  end


  it "add some Users as owner with with already existing users" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_admin,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,owner,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_participant,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add empty as owner" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: owner))
    mut.resolve(
      project_id: project.id,
      user_ids: [],
      is_admin: true
    )

    expect(ProjectMember.count).to eq 2
  end

  it "add some Users as admin" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: user_admin))
    mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user1.id,user2.id],
      is_admin: true
    )
    expect(ProjectMember.find_by(user_id: user1).membership_type).to eq "admin"
    expect(ProjectMember.count).to eq 5

    mut = described_class.new(**init_args(user: user_admin))
    mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )
    expect(ProjectMember.find_by(user_id: user3).membership_type).to eq "participant"
    expect(ProjectMember.count).to eq 8
  end


  it "add some Users as admin with with already existing users" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    mut = described_class.new(**init_args(user: user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_admin,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,owner,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_participant,user2.id],
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add empty as admin" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user_admin))
    mut.resolve(
      project_id: project.id,
      user_ids: [],
      is_admin: true
    )

    expect(ProjectMember.count).to eq 2
  end

  it "add some Users as participant in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user1.id,user2.id],
      is_admin: true
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant))
    mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )
    expect(ProjectMember.find_by(user_id: user3).membership_type).to eq "participant"
    expect(ProjectMember.count).to eq 5
  end

  it "add some Users as participant in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user1.id,user2.id],
      is_admin: true
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
  end


  it "add some Users as participant with with already existing users" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_admin,user2.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,owner,user2.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user.id,user_participant,user2.id],
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
  end

  it "add empty as participant" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user_participant))
    mut.resolve(
      project_id: project.id,
      user_ids: [],
      is_admin: true
    )

    expect(ProjectMember.count).to eq 2
  end

  it "add some Users as User in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user1.id,user2.id],
      is_admin: true
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
  end

  it "add some Users as User in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    user3 = create(:user)
    user4 = create(:user)
    user5 = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user1.id,user2.id],
      is_admin: true
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user3.id,user4.id,user5.id],
      is_admin: false
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
  end


  it "add some Users as User with with already existing users" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")


    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)
    user1 = create(:user)
    user2 = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user1,user_admin,user2.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user1,user.id,owner,user2.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [user1,user.id,user_participant,user2.id],
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2
  end

  it "add empty as User" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_ids: [],
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2
  end


end