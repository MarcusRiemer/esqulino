require "rails_helper"

RSpec.describe Mutations::Projects::ChangeMemberRole do

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

  it "change User role as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "participant"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "admin"



    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2 

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2 
  end

  it "change User role as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "participant"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "admin"



    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2 

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2 
  end


  it "change User role as admin in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "participant"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "admin"



    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3
end

it "change User role as admin in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "participant"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) 
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "admin"



    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 3
end

it "change User role as participant in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_participant  = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"



    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 3
end

it "change User role as participant in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_participant  = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 3
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"



    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 3

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 3
end

it "change User role as user in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    #Same role as admin
    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    #Other role as admin
    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"

    #Same role as participant
    mut = described_class.new(**init_args(user: current_user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    #Other role as participant
    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"



    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)

    expect(ProjectMember.count).to eq 2
end

it "change own user role" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")


    mut = described_class.new(**init_args(user: user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: true
    )
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "admin"
    
    mut = described_class.new(**init_args(user: user_admin))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
      is_admin: false
    ) 
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_admin.id).membership_type).to eq "participant"

    
    mut = described_class.new(**init_args(user: user_participant))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2
    expect( Project.first.project_members.find_by(user_id: user_participant.id).membership_type).to eq "participant"

    mut = described_class.new(**init_args(user: user))
    expect{ mut.resolve(
      project_id: project.id,
      user_id: user.id,
      is_admin: false
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
      is_admin: true
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: false
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
      is_admin: true
    ) }.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 2
end
end