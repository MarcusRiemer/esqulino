require "rails_helper"

RSpec.describe Resolvers::ProjectInstanceMemberResolver do
  before(:each) { create(:user, :guest) }

  SPEC_QUERY = <<-GQL
    query FullProject($input: ProjectInputType) {
      projects(input: $input) {
        nodes {
          id
          name
          slug
          projectMembers {
            id
            membershipType
            userId
          }
        }
      }
    }
  GQL

  def exec_project_query(
        languages: nil,
        order: nil,
        filter: nil,
        user:
      )
    variables = {
      input: {
        languages: languages,
        order: order,
        filter: filter
      }
    }
    res = execute_query(
      query: SPEC_QUERY,
      variables: variables,
      user: user
    )

    return res["data"]["projects"]["nodes"]
             .first["projectMembers"]
             .pluck("userId")
  end

  describe "One admin project member" do
    let(:u) { FactoryBot.create(:user) }
    let(:p) { FactoryBot.create(:project) }

    before(:each) do
      p.project_members.create(user_id: u.id, membership_type: "admin")
    end

    it "as guest" do
      res = exec_project_query(user: User.guest)
      expect(res).to eq []
    end

    it "as owner" do
      res = exec_project_query(user: p.user)
      expect(res).to match_array([u.id])
    end
  end
end