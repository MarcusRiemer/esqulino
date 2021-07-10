require 'rails_helper'

RSpec.describe AssignmentRequiredCodeResource, type: :model do
  it "validate programming language" do 
    assignment = create(:assignment)
    block = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block ]
    p.save!

    create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: block.default_programming_language_id )
    expect{create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: pl.id )}.to raise_error(ActiveRecord::RecordInvalid)

  end

  it "validate programming language with many possible block_languages" do 
    assignment = create(:assignment)
    block = create(:block_language)
    block2 = create(:block_language)
    block3 = create(:block_language)
    pl = create(:programming_language)
    
    p = assignment.project
    p.block_languages = [ block, block2, block3 ]
    p.save!

    create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: block.default_programming_language_id )
    create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: block2.default_programming_language_id )
    create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: block3.default_programming_language_id )
    expect{create(:assignment_required_code_resource, assignment_id: assignment.id, name: "test", programming_language_id: pl.id )}.to raise_error(ActiveRecord::RecordInvalid)

  end
end
