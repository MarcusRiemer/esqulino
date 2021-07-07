require "rails_helper"

RSpec.describe Mutations::Projects::CreateCourseParticipation do

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

      it "create a course project with 2 users" do
        owner = create(:user)
        project = create(:project, user_id: owner.id, public: false)

       user1 = create(:user) 
       user2 = create(:user)

        mut = described_class.new(**init_args(user: owner))
        res = mut.resolve(
            based_on_project_id: project.id,
            user_ids: [user1.id, user2.id],
            slug: "testomesto"
          )

          expect(Project.count).to eq 2
        expect(Project.find_by(slug:"testomesto").members.count).to eq 2
        expect(Project.find_by(slug:"testomesto").members.find(user1.id)).to eq user1
        expect(Project.find_by(slug:"testomesto").members.find(user2.id)).to eq user2
        expect( Project.find_by(slug:"testomesto").project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
        expect( Project.find_by(slug:"testomesto").project_members.find_by(user_id: user2.id).membership_type).to eq "participant"
        expect( Project.find_by(slug:"testomesto").based_on_project).to eq project
        expect(Project.find_by(slug:"testomesto").user).to eq owner
    end

    it "create a course project with 0 user" do
    end

    it "create a course project without a slug" do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: false)

     user1 = create(:user) 
     user2 = create(:user)

      mut = described_class.new(**init_args(user: owner))
       res = mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id, user2.id]
        )

      expect(Project.count).to eq 2
      expect(Project.find(res[:project][:id])).not_to eq project.id
      expect(Project.find(res[:project][:id]).members.count).to eq 2
      expect(Project.find(res[:project][:id]).members.find(user1.id)).to eq user1
      expect(Project.find(res[:project][:id]).members.find(user2.id)).to eq user2
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user2.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).based_on_project).to eq project
      expect(Project.find(res[:project][:id]).user).to eq owner
    end



    it "create a course project as admin" do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: false)
      
      user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

     user1 = create(:user) 
     user2 = create(:user)

      mut = described_class.new(**init_args(user: user_admin))
      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id],
        slug: "testomesto"
      )

      expect(Project.count).to eq 2
        expect(Project.find_by(slug:"testomesto").members.count).to eq 2
        expect(Project.find_by(slug:"testomesto").members.find(user1.id)).to eq user1
        expect(Project.find_by(slug:"testomesto").members.find(user2.id)).to eq user2
        expect( Project.find_by(slug:"testomesto").project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
        expect( Project.find_by(slug:"testomesto").project_members.find_by(user_id: user2.id).membership_type).to eq "participant"
        expect( Project.find_by(slug:"testomesto").based_on_project).to eq project
        expect(Project.find_by(slug:"testomesto").user).to eq owner
    end

    it "create a course project with not existing user " do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: false)
      
      user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

     user1 = create(:user) 
     user2 = create(:user)

      mut = described_class.new(**init_args(user: user_admin))
      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id, "23131313131"],
        slug: "testomesto"
      )}.to raise_error(ActiveRecord::RecordNotFound)

      expect(Project.count).to eq 1
    end

    it "create a course project with owner as a member of the project " do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: false)
      
      user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

     user1 = create(:user) 
     user2 = create(:user)

      mut = described_class.new(**init_args(user: user_admin))
      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id, owner.id],
        slug: "testomesto"
      )}.to raise_error(ArgumentError)

      expect(Project.count).to eq 1
    end

    it "create a course project as user in a public project" do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: true)

     user1 = create(:user) 

      mut = described_class.new(**init_args(user: user1))
      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id],
        slug: "testomesto"
      )

      expect(Project.count).to eq 2
      expect(Project.find_by(slug:"testomesto").members.count).to eq 1
      expect(Project.find_by(slug:"testomesto").members.find(user1.id)).to eq user1
      expect( Project.find_by(slug:"testomesto").project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
      expect( Project.find_by(slug:"testomesto").based_on_project).to eq project
      expect(Project.find_by(slug:"testomesto").user).to eq owner
    end

    it "create a course project as user in a private project" do
      owner = create(:user)
      project = create(:project, user_id: owner.id, public: false)
      
     user1 = create(:user) 

      mut = described_class.new(**init_args(user: user1))
      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id],
        slug: "testomesto"
      )}.to raise_error(Pundit::NotAuthorizedError)

      expect(Project.count).to eq 1
    end

    it "create a course project of a course project" do
      owner = create(:user)
      course = create(:project_course_participation)

      project = course.participant_project
      project.user = owner 
      project.save!
      
     user1 = create(:user) 

      mut = described_class.new(**init_args(user: owner))
      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id],
        slug: "testomesto"
      )}.to raise_error(ArgumentError)

      expect(Project.count).to eq 2
    end
end