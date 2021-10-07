require "rails_helper"

RSpec.describe Mutations::Projects::ChangeOwner do

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

  it "change owner as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq current_user_owner
  
  end

  it "change owner as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: current_user_owner.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq current_user_owner
  
  end

  it "change admin as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user_admin
  
  end

  it "change admin as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user_admin
  end


  it "change participant as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user_participant
  end

  it "change participant as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) 
    expect( ProjectMember.count ).to eq 2
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user_participant
  end

  it "change user as owner in public group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: true)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect( ProjectMember.count ).to eq 3
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user
  end

  it "change user as owner in private group" do
    current_user_owner = create(:user, display_name: "Owner")
    project = create(:project, user: current_user_owner, public: false)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_owner))
    res = mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) 
    expect( ProjectMember.count ).to eq 3
    expect( ProjectMember.find_by(user_id: current_user_owner.id).user ).to eq current_user_owner
    expect( Project.first.user).to eq user
  end



  it "change owner as admin in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

  end

  it "change owner as admin in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_admin = create(:user)
    project.project_members.create(user_id: current_user_admin.id, membership_type: "admin")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user_admin))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner
  end

  it "change owner as participant in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner
  end

  it "change owner as participant in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user_participant = create(:user)
    project.project_members.create(user_id: current_user_participant.id, membership_type: "participant")

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user_participant))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 3
    expect( Project.first.user).to eq owner
  end

  it "change owner as user in public group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: true)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner
  end

  it "change owner as user in private group" do
    owner = create(:user, display_name: "Owner")
    project = create(:project, user: owner, public: false)

    current_user = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

    user_participant = create(:user)
    project.project_members.create(user_id: user_participant.id, membership_type: "participant")

    user = create(:user)

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: owner.id,
    )}.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_admin.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user_participant.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner

    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner


    #Selfe
    mut = described_class.new(**init_args(user: current_user))
    expect{mut.resolve(
      project_id: project.id,
      user_id: current_user.id,
    ) }.to raise_error(Pundit::NotAuthorizedError)
    expect( ProjectMember.count ).to eq 2
    expect( Project.first.user).to eq owner
  end

  fit "change owner which is member of participant group" do
    current_user_owner = create(:user, display_name: "Owner")
    course = create(:project, user: current_user_owner, public: false, course_template: true)

    group = create(:project, based_on_project: course)
    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: current_user_owner))
    expect{mut.resolve(
      project_id: course.id,
      user_id: participant.id,
    )}.to raise_error(ArgumentError)

    expect(Project.find(course.id).user).to eq current_user_owner
    end
  
end