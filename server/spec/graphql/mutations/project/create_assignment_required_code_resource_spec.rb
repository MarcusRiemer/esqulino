require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredCodeResource do

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

  it "create assignment required normal work" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.user = owner
    p.save! 

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id
    )


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.description).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.programming_language).to eq block.default_programming_language
    expect( AssignmentRequiredCodeResource.first.name).to eq "Aufgabe 1"

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 2",
      description: "Test",
      programming_language_id:  block2.default_programming_language.id
    )

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 2
    expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2" ).description).to eq "Test"
    expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2" ).programming_language).to eq block2.default_programming_language

    mut = described_class.new(**init_args(user: owner))
    res = mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 3",
      programming_language_id:  block3.default_programming_language.id
    )

    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 3
    expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3" ).description).to eq nil
    expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3" ).programming_language).to eq block3.default_programming_language
  end

  it "create assignment required code resource no permissions" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.user = owner
    p.save! 

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id
    )}.to raise_error(Pundit::NotAuthorizedError)

    expect( AssignmentRequiredCodeResource.count ).to eq 0
  end

 it "create assignment required code resource with empty description" do
  owner = create(:user)
  assignment = create(:assignment)
  block = create(:block_language)
  block2 = create(:block_language)
  block3 = create(:block_language)
  pl = create(:programming_language)
  
  p = assignment.project
  p.block_languages = [ block, block2, block3 ]
  p.user = owner
  p.save! 

  mut = described_class.new(**init_args(user: owner))
  res = mut.resolve(
    assignment_id: assignment.id,
    name: "Aufgabe 1",
    description: "",
    programming_language_id:  block.default_programming_language.id
  )

    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.description).to eq nil
    expect( AssignmentRequiredCodeResource.first.programming_language).to eq block.default_programming_language
    expect( AssignmentRequiredCodeResource.first.name).to eq "Aufgabe 1"
  end


  it "create assignment required code resource with empty name" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.user = owner
    p.save! 

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "",
      description: "asd",
      programming_language_id:  block.default_programming_language.id
    )}.to raise_error(ActiveRecord::RecordInvalid)
  
    expect( AssignmentRequiredCodeResource.count ).to eq 0  
end

  it "create assignment required code resource with empty programming language" do
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.user = owner
    p.save! 

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  ""
    )}.to raise_error(ActiveRecord::RecordInvalid)

    expect( AssignmentRequiredCodeResource.count ).to eq 0  
    end

    it "create assignment required code resource with not existing programming language" do
      owner = create(:user)
      assignment = create(:assignment)
      block = create(:block_language)
      block2 = create(:block_language)
      block3 = create(:block_language)

      p = assignment.project
      p.block_languages = [ block, block2, block3 ]
      p.user = owner
      p.save! 
  
      mut = described_class.new(**init_args(user: owner))
      expect{mut.resolve(
        assignment_id: assignment.id,
        name: "Aufgabe 1",
        description: "Test",
        programming_language_id:  "123123"
      )}.to raise_error(ActiveRecord::RecordInvalid)
  
  
      expect( Assignment.count ).to eq 1
      expect( AssignmentRequiredCodeResource.count).to eq 0
    end

    it "create assignment required code resource with programming language which are not allowed in this project" do
      owner = create(:user)
      assignment = create(:assignment)
      block = create(:block_language)
      block2 = create(:block_language)
      block3 = create(:block_language)
      pl = create(:programming_language)

      p = assignment.project
      p.block_languages = [ block, block2, block3 ]
      p.user = owner
      p.save! 
  
      mut = described_class.new(**init_args(user: owner))
      expect{mut.resolve(
        assignment_id: assignment.id,
        name: "Aufgabe 1",
        description: "Test",
        programming_language_id:  pl.id
      )}.to raise_error(ActiveRecord::RecordInvalid)
  
  
      expect( Assignment.count ).to eq 1
      expect( AssignmentRequiredCodeResource.count).to eq 0
    end

    it "create assignment required code resource with a project which have 0 block_languages" do
      owner = create(:user)
      assignment = create(:assignment)
      pl = create(:programming_language)

      p = assignment.project
      p.user = owner
      p.save! 
  
      mut = described_class.new(**init_args(user: owner))
      expect{mut.resolve(
        assignment_id: assignment.id,
        name: "Aufgabe 1",
        description: "Test",
        programming_language_id:  pl.id
      )}.to raise_error(ActiveRecord::RecordInvalid)
  
  
      expect( Assignment.count ).to eq 1
      expect( AssignmentRequiredCodeResource.count).to eq 0
    end

end