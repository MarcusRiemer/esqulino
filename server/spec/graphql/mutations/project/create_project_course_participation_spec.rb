require "rails_helper"

RSpec.describe Mutations::Projects::CreateProjectCourseParticipation do

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


      it "Create course simple" do
        project = create(:project, slug:"course-test")
        assignment = create(:assignment, project: project, name: "test")
        user1 = create(:user)
        
        mut = described_class.new(**init_args(user: project.user))

        res = mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id],
          group_name: {"de"=>"Group 1"}
        
        )

        expect(Project.count).to eq 2 
        expect(ProjectCourseParticipation.count).to eq 1
        expect(Project.find(res[:project][:id]).name).to eq ({"de"=>"Group 1"})
        expect(Project.find(res[:project][:id]).assignments.count).to eq 0
        expect(Project.find(res[:project][:id]).user).to eq project.user
        expect(Project.find(res[:project][:id]).based_on_project).to eq project
        expect(ProjectMember.count).to eq 1 
        expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user1.id).membership_type).to eq "participant"



        user2 = create(:user)
        user3 = create(:user)

        mut = described_class.new(**init_args(user: project.user))

        res = mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user2.id,user3.id],
          group_name: {"de"=>"Group 2"}
        )

        expect(Project.count).to eq 3
        expect(ProjectCourseParticipation.count).to eq 2
        expect(Project.find(res[:project][:id]).name).to eq({"de"=>"Group 2"})
        expect(Project.find(res[:project][:id]).assignments.count).to eq 0
        expect(Project.find(res[:project][:id]).user).to eq project.user
        expect(Project.find(res[:project][:id]).based_on_project).to eq project
        expect(ProjectMember.count).to eq 3
        expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user2.id).membership_type).to eq "participant"
        expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user3.id).membership_type).to eq "participant"


        

        #Don´t Copy 
        project2 = create(:project, slug:"course-123")
        user4 = create(:user)
        user5 = create(:user)

        
        assignment = create(:assignment, project: project2, name: "test")

        code_resource = create(:code_resource, project: project2)
        
        

        project_database = create(:project_database, project: project2, name: "1")
        project_source = create(:project_source, project: project2, title:"1")
        block_language = create(:project_uses_block_language, project: project2)
        create(:project_member, project: project2, membership_type: "participant")

       

        mut = described_class.new(**init_args(user: project2.user))
  
        res = mut.resolve(
          based_on_project_id: project2.id,
          user_ids: [user4.id, user5.id],
          group_name: {"de"=>"Group 3"}
        )
  

        expect(Project.find(res[:project][:id]).code_resources.count).to eq 0
        expect(Project.find(res[:project][:id]).assignments.count).to eq 0
        expect(Project.find(res[:project][:id]).project_databases.first).not_to eq project_database
        expect(Project.find(res[:project][:id]).project_databases.count).to eq  1
        expect(Project.find(res[:project][:id]).project_sources.first).not_to eq code_resource
        expect(Project.find(res[:project][:id]).project_sources.count).to eq 1
        expect(Project.find(res[:project][:id]).project_uses_block_languages.count).to eq 2

        expect(Project.count).to eq 5
        expect(ProjectCourseParticipation.count).to eq 3
        expect(ProjectMember.count).to eq 6
        expect(ProjectDatabase.count).to eq 2
        expect(ProjectSource.count).to eq 2
        expect(ProjectUsesBlockLanguage.count).to eq 4
        
        
        
      end

    it "private course add users" do
      project = create(:project, slug:"course-test", public: false)
      assignment = create(:assignment, project: project, name: "test")
      user1 = create(:user)
      user2 = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

      
      
      mut = described_class.new(**init_args(user: user_admin))

      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id],
        group_name: {"de"=>"Group 1"}
      )

      expect(Project.count).to eq 2 
      expect(ProjectCourseParticipation.count).to eq 1
      expect(Project.find(res[:project][:id]).name).to eq({"de"=>"Group 1"})
      expect(Project.find(res[:project][:id]).assignments.count).to eq 0
      expect(Project.find(res[:project][:id]).user).to eq project.user
      expect(Project.find(res[:project][:id]).based_on_project).to eq project
      expect(ProjectMember.count).to eq 3
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user2.id).membership_type).to eq "participant"


      mut = described_class.new(**init_args(user: user1))

      user3 = create(:user)
      user4 = create(:user)

      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user3.id, user4.id],
        group_name: {"de"=>"Group 1"}
      )}.to raise_error(Pundit::NotAuthorizedError)

      expect(Project.count).to eq 2 
      expect(ProjectCourseParticipation.count).to eq 1
      expect(ProjectMember.count).to eq 3



      project2 = create(:project, slug:"course-test2")

      mut = described_class.new(**init_args(user: project2.user))

      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user3.id, user4.id],
        group_name: {"de"=>"Group 1"}
      )}.to raise_error(Pundit::NotAuthorizedError)

      expect(Project.count).to eq 3 
      expect(ProjectCourseParticipation.count).to eq 1
      expect(ProjectMember.count).to eq 3


    end

    it "public course add users" do
      project = create(:project, slug:"course-test", public: true)
      assignment = create(:assignment, project: project, name: "test")
      user1 = create(:user)
      user2 = create(:user)

    user_admin = create(:user)
    project.project_members.create(user_id: user_admin.id, membership_type: "admin")

      
      
      mut = described_class.new(**init_args(user: user_admin))

      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id],
        group_name: {"de"=>"Group 1"}
      )

      expect(Project.count).to eq 2 
      expect(ProjectCourseParticipation.count).to eq 1
      expect(Project.find(res[:project][:id]).name).to eq({"de"=>"Group 1"})
      expect(Project.find(res[:project][:id]).assignments.count).to eq 0
      expect(Project.find(res[:project][:id]).user).to eq project.user
      expect(Project.find(res[:project][:id]).based_on_project).to eq project
      expect(ProjectMember.count).to eq 3
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user1.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user2.id).membership_type).to eq "participant"


      mut = described_class.new(**init_args(user: user1))

      user3 = create(:user)
      user4 = create(:user)

      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user3.id, user4.id],
        group_name: {"de"=>"Group 1"}
      )

      expect(Project.count).to eq 3
      expect(ProjectCourseParticipation.count).to eq 2
      expect(ProjectMember.count).to eq 5
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user3.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user4.id).membership_type).to eq "participant"



      project2 = create(:project, slug:"course-test2", public: true)

      mut = described_class.new(**init_args(user: project2.user))

      user5 = create(:user)
      user6 = create(:user)

      res = mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user5.id, user6.id],
        group_name: {"de"=>"Group 1"}
      )

      expect(Project.count).to eq 5
      expect(ProjectCourseParticipation.count).to eq 3
      expect(ProjectMember.count).to eq 7
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user5.id).membership_type).to eq "participant"
      expect( Project.find(res[:project][:id]).project_members.find_by(user_id: user6.id).membership_type).to eq "participant"

    end

    it "Create course of a project which is not a course" do
      project = create(:project, slug:"test2")
      user1 = create(:user)
      user2 = create(:user)
      assignment = create(:assignment, project: project, name: "test")
      code_resource = create(:code_resource, project: project)

      project_database = create(:project_database, project: project, name: "1")
      project_source = create(:project_source, project: project, title:"1")
      block_language = create(:project_uses_block_language, project: project)
      
      expect(ProjectUsesBlockLanguage.count).to eq 2

      mut = described_class.new(**init_args(user: project.user))

      expect{mut.resolve(
        based_on_project_id: project.id,
        user_ids: [user1.id, user2.id],
        group_name: {"de"=>"Group 1"}
      )}.to raise_error(ArgumentError)

      expect(Project.count).to eq 1
      expect(ProjectCourseParticipation.count).to eq 0
      expect(ProjectMember.count).to eq 0
      expect(ProjectDatabase.count).to eq 1
      expect(ProjectSource.count).to eq 1
      expect(ProjectUsesBlockLanguage.count).to eq 2
    end

    it "Create course of a project which is a child course" do
      project = create(:project, slug:"course-test", public: false)
      user1 = create(:user)
      user2 = create(:user)

    user_admin = create(:user)

      project2 = create(:project, slug:"c2", based_on_project: project)
      
      mut = described_class.new(**init_args(user: project2.user))

      expect{mut.resolve(
        based_on_project_id: project2.id,
        user_ids: [user1.id, user2.id],
        group_name: {"de"=>"Group 1"}
      )}.to raise_error(ArgumentError)

      expect(Project.count).to eq 2 
      expect(ProjectCourseParticipation.count).to eq 1

    end

      it "Create course with non users" do
        project = create(:project, slug:"course-test", public: false)
        user1 = create(:user)
        user2 = create(:user)
  
      user_admin = create(:user)

        
        mut = described_class.new(**init_args(user: project.user))
  
        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [],
          group_name: "Group 1"
        )}.to raise_error(ArgumentError)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
      end

      it "Create course added users with on not allowed user" do
        project = create(:project, slug:"course-test", public: false)
        user1 = create(:user)
        user2 = create(:user)
  
        user_admin = create(:user)
        project.project_members.create(user_id: user_admin.id, membership_type: "admin")

        mut = described_class.new(**init_args(user: project.user))
  
        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id,user2.id, user_admin.id],
          group_name: {"de"=>"Group 1"}
        )}.to raise_error(ArgumentError)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
        expect(ProjectMember.count).to eq 1
        expect(ProjectDatabase.count).to eq 0
        expect(ProjectSource.count).to eq 0

        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id,user2.id, project.user.id]
        )}.to raise_error(ArgumentError)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
        expect(ProjectMember.count).to eq 1
        expect(ProjectDatabase.count).to eq 0
        expect(ProjectSource.count).to eq 0


        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id,user2.id, 1231],
          group_name: {"de"=>"Group 1"}
        )}.to raise_error(ActiveRecord::RecordNotFound)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
        expect(ProjectMember.count).to eq 1
        expect(ProjectDatabase.count).to eq 0
        expect(ProjectSource.count).to eq 0

       
      end


      #TODO
      it "Create course added a user 2 times" do
        project = create(:project, slug:"course-test")
        assignment = create(:assignment, project: project, name: "test")
        user1 = create(:user)
        
        mut = described_class.new(**init_args(user: project.user))

        res = mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id],
          group_name: {"de"=>"Group 1"}
        )
        res = mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1.id],
          group_name: {"de"=>"Group 1"}
        )

        expect(Project.count).to eq 3
        expect(ProjectCourseParticipation.count).to eq 2
        expect(ProjectMember.count).to eq 2 

      end



      it "Create course without Name" do
        project = create(:project, slug:"course-test", public: false)
        user1 = create(:user)
        user2 = create(:user)
  
      user_admin = create(:user)

        
        mut = described_class.new(**init_args(user: project.user))
  
        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1,user2],
          group_name: {}
        )}.to raise_error(ActiveRecord::RecordInvalid)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
      end

      it "Create course without Name" do
        project = create(:project, slug:"course-test", public: false)
        user1 = create(:user)
        user2 = create(:user)
  
      user_admin = create(:user)

        
        mut = described_class.new(**init_args(user: project.user))
  
        expect{mut.resolve(
          based_on_project_id: project.id,
          user_ids: [user1,user2],
          group_name: {"ma"=>"Group 1"}
        )}.to raise_error(ActiveRecord::RecordInvalid)
  
        expect(Project.count).to eq 1
        expect(ProjectCourseParticipation.count).to eq 0
      end



end