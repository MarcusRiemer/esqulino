require 'rails_helper'

RSpec.describe GrammarReference, type: :model do
  it 'include_types' do
    origin = create(:grammar)
    target = create(:grammar)

    reference = create(:grammar_reference,
                       origin:,
                       target:,
                       reference_type: 'include_types')

    expect(GrammarReference.include_types).to eq([reference])
    expect(GrammarReference.visualize).to eq([])
  end

  it 'visualizes' do
    origin = create(:grammar)
    target = create(:grammar)

    reference = create(:grammar_reference,
                       origin:,
                       target:,
                       reference_type: 'visualize')

    expect(GrammarReference.include_types).to eq([])
    expect(GrammarReference.visualize).to eq([reference])
  end
end
