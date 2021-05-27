require "rails_helper"

RSpec.describe Mutations::Projects::RemoveMember do

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

  it "remove User role as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect(ProjectMember.count).to eq 0
    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil


    mut = described_class.new(**init_args(user: current_user_owner))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 0

  end


  it "remove User role as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil


    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect(ProjectMember.count).to eq 0
    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil


    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 0

  end


  it "remove User role as admin in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user_user_admin = create(:user)
    project.project_members.create(user_id: current_user_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil


    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 1

  end



  it "remove User role as admin in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user_user_admin = create(:user)
    project.project_members.create(user_id: current_user_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil

    mut = described_class.new(**init_args(user: current_user_user_admin))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 1

  end



  it "remove User role as participant in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user_participant  = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

  end

  it "remove User role as participant in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user_participant  = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3


    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3

  end

  it "remove User role as user in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user = create(:user)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

  end

  it "remove User role as user in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user = create(:user)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")



    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

  end

  it "remove own User role in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil


    mut = described_class.new(**init_args(user: user_participant))
    res =  mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 

    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil
    expect(ProjectMember.count).to eq 0
  end

  it "remove own User role in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    ) }.to raise_error(ArgumentError)
    expect(ProjectMember.count).to eq 2


    mut = described_class.new(**init_args(user: user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.find_by(user_id: user_admin.id,)).to eq nil


    mut = described_class.new(**init_args(user: user_participant))
    res =  mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 

    expect(ProjectMember.find_by(user_id: user_participant.id,)).to eq nil
    expect(ProjectMember.count).to eq 0
  end
end