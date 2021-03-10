require "rails_helper"

RSpec.describe Mutations::CreateProgrammingLanguage do

  # These specs relies on
  # * an existing guest user
  # * an existing meta grammar language
  before(:each) {
    create(:user, :guest)
    create(:block_language, id: BlockLanguage.meta_grammar_id)
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

  it "Registered user creates a new project" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)
    mut = described_class.new(**init_args(user: creator))
    res = mut.resolve(
      project_id: project.id,
      language_name: "l",
    )

    expect(Project.count).to eq 1

    p = Project.first
  end
end