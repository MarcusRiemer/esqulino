require "rails_helper"

RSpec.describe Mutations::Projects::CreateAssignmentRequiredTemplate do

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

  it "create assignment required template normal work" do
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
      programming_language_id:  block.default_programming_language.id,
      reference_type: "given_full",
      block_language_id: block.id
    )


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 1
    expect( AssignmentRequiredCodeResource.first.description).to eq "Test"
    expect( AssignmentRequiredCodeResource.first.programming_language).to eq block.default_programming_language
    expect( AssignmentRequiredCodeResource.first.name).to eq "Aufgabe 1"

    expect( AssignmentTemplateCodeResource.count).to eq 1
    expect( AssignmentTemplateCodeResource.first.reference_type).to eq "given_full"
    expect( AssignmentTemplateCodeResource.first.code_resource).to eq CodeResource.first
    expect( CodeResource.count).to eq 1
    expect( CodeResource.first.block_language).to eq block 
    expect( CodeResource.first.programming_language).to eq block.default_programming_language 


    res = mut.resolve(
        assignment_id: assignment.id,
        name: "Aufgabe 2",
        description: "Test",
        programming_language_id:  block2.default_programming_language.id,
        reference_type: "given_partially",
        block_language_id: block2.id
      )
  
  
      expect( Assignment.count ).to eq 1
      expect( AssignmentRequiredCodeResource.count).to eq 2
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2").description).to eq "Test"
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2").programming_language).to eq block2.default_programming_language
  
      expect( AssignmentTemplateCodeResource.count).to eq 2
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2").template.reference_type).to eq "given_partially"
      expect( CodeResource.count).to eq 2
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2").template.code_resource.block_language).to eq block2 
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 2").template.code_resource.programming_language).to eq block2.default_programming_language 

      res = mut.resolve(
        assignment_id: assignment.id,
        name: "Aufgabe 3",
        description: "",
        programming_language_id:  block3.default_programming_language.id,
        reference_type: "given_partially",
        block_language_id: block3.id
      )
  
  
      expect( Assignment.count ).to eq 1
      expect( AssignmentRequiredCodeResource.count).to eq 3
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3").description).to eq nil
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3").programming_language).to eq block3.default_programming_language
  
      expect( AssignmentTemplateCodeResource.count).to eq 3
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3").template.reference_type).to eq "given_partially"
      expect( CodeResource.count).to eq 3
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3").template.code_resource.block_language).to eq block3 
      expect( AssignmentRequiredCodeResource.find_by(name: "Aufgabe 3").template.code_resource.programming_language).to eq block3.default_programming_language 

  
  end


  it "create assignment required template wrong programming_language" do
    #Project without a block_language
    owner = create(:user)
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.user = owner
    p.save! 

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id,
      reference_type: "given_full",
      block_language_id: block.id
    )}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0
    
    #Does not match a block_languages of the project -> it is allowed to have a code resource with different block and programming language
    #p.block_languages = [ block, block2 ]
    #p.save! 

    #mut = described_class.new(**init_args(user: owner))
    #expect{mut.resolve(
    #  assignment_id: assignment.id,
    #  name: "Aufgabe 1",
    #  description: "Test",
    #  programming_language_id:  block3.default_programming_language.id,
    #  reference_type: "given_full",
    #  block_language_id: block.id
    #)}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0

    #The programming_language don´t exist 

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  "123",
      reference_type: "given_full",
      block_language_id: block.id
    )}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0


    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block2.default_programming_language.id,
      reference_type: "given_full",
      block_language_id: block.id
    )}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0

    
  end


  it "create assignment required template wrong block_language" do
        owner = create(:user)
        assignment = create(:assignment)
        block = create(:block_language)
        block2 = create(:block_language)
        block3 = create(:block_language)
        pl = create(:programming_language)
        
        p = assignment.project
        p.user = owner
        p.save! 
    
        mut = described_class.new(**init_args(user: owner))
        expect{mut.resolve(
          assignment_id: assignment.id,
          name: "Aufgabe 1",
          description: "Test",
          programming_language_id:  block.default_programming_language.id,
          reference_type: "given_full",
          block_language_id: block.id
        )}.to raise_error(ActiveRecord::RecordInvalid)
    
    
        expect( Assignment.count ).to eq 1
        expect( AssignmentRequiredCodeResource.count).to eq 0
        expect( AssignmentTemplateCodeResource.count).to eq 0
        expect( CodeResource.count).to eq 0



    

    #Does not match a block_languages of the project 
    p.block_languages = [ block, block2 ]
    p.save! 

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id,
      reference_type: "given_full",
      block_language_id: block3.id
    )}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0

    #The block_language don´t exist 
    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id,
      reference_type: "given_full",
      block_language_id: "123123"
    )}.to raise_error(ActiveRecord::RecordInvalid)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0
  end

  it "create assignment required template wrong reference_type" do
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
      programming_language_id:  block.default_programming_language.id,
      reference_type: "full",
      block_language_id: block.id
    )}.to raise_error(ArgumentError)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id,
      reference_type: "",
      block_language_id: block.id
    )}.to raise_error(ActiveRecord::NotNullViolation)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0

    mut = described_class.new(**init_args(user: owner))
    expect{mut.resolve(
      assignment_id: assignment.id,
      name: "Aufgabe 1",
      description: "Test",
      programming_language_id:  block.default_programming_language.id,
      reference_type: "   ",
      block_language_id: block.id
    )}.to raise_error(ActiveRecord::NotNullViolation)


    expect( Assignment.count ).to eq 1
    expect( AssignmentRequiredCodeResource.count).to eq 0
    expect( AssignmentTemplateCodeResource.count).to eq 0
    expect( CodeResource.count).to eq 0
  end
end