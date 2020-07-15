require 'rails_helper'

RSpec.describe GrammarReference, type: :model do
  it 'include_types' do
    origin = create(:grammar)
    target = create(:grammar)

    reference = create(:grammar_reference,
                       origin: origin,
                       target: target,
                       reference_type: "include_types")

    expect(GrammarReference.include_types).to eq([reference])
  end
end
