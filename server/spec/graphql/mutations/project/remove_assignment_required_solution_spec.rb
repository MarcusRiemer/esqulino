require "rails_helper"

RSpec.describe Mutations::Projects::RemoveAssignmentRequiredSolution do

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

  it "remove assignment required solution normal work" do
    owner = create(:user)
    assignment = create(:assignment)

    block = create(:block_language)
    block2 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    code_resource = create(:code_resource, project: p, block_language:block, programming_language: block.default_programming_language)
    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language,solution: code_resource)
   
    expect( AssignmentRequiredCodeResource.first.solution).not_to eq nil

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_required_code_resource_id: requried.id,
    )


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution).to eq nil
    expect( CodeResource.count).to eq 1
  end



  it "remove assignment required solution no permission" do
    owner = create(:user)
    assignment = create(:assignment)

    user = create(:user)

    block = create(:block_language)
    block2 = create(:block_language)
    
    p = assignment.project
    p.block_languages = [ block, block2 ]
    p.user = owner
    p.save! 

    code_resource = create(:code_resource, project: p, block_language:block, programming_language: block.default_programming_language)
    requried = create(:assignment_required_code_resource, assignment_id: assignment.id, programming_language: block.default_programming_language,solution: code_resource)
   
    expect( AssignmentRequiredCodeResource.first.solution).not_to eq nil

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      assignment_required_code_resource_id: requried.id,
    )}.to raise_error(Pundit::NotAuthorizedError)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.solution).not_to eq nil
    expect( CodeResource.count).to eq 1
  end



end