require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssigmentSubmission do

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

  it "create assigment submission normal work" do
    a = create(:assigment)

    mut = described_class.new(**init_args(user: a.project.user))

    res = mut.resolve(
        assigment_id: a.id
    )

    expect( AssigmentSubmission.count ).to eq 1
    expect(AssigmentSubmission.first.assigment_id).to eq a.id
  end

  it "create assigment submission as member" do
    a = create(:assigment)


    user= create(:user, display_name: "participant")
    a.project.project_members.create(user_id: user.id, membership_type: "participant")

    mut = described_class.new(**init_args(user: user))

    res = mut.resolve(
        assigment_id: a.id
    )

    expect( AssigmentSubmission.count ).to eq 1
    expect(AssigmentSubmission.first.assigment_id).to eq a.id
  end

  it "create assigment submission as not a member" do
    a = create(:assigment)

    user= create(:user, display_name: "user")

    mut = described_class.new(**init_args(user: user))

    expect{ mut.resolve(
        assigment_id: a.id
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssigmentSubmission.count ).to eq 0
  end


  it "create assigment submission with wrong assigment_id" do
    a = create(:assigment)

    mut = described_class.new(**init_args(user: a.project.user))

    expect{mut.resolve(
        assigment_id: "123131"
    )}.to raise_error(ActiveRecord::RecordNotFound)

    expect( AssigmentSubmission.count ).to eq 0

  end

end