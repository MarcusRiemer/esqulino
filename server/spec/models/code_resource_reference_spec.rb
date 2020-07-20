require 'rails_helper'

RSpec.describe CodeResourceReference, type: :model do
  it 'Generic reference' do
    origin = create(:code_resource)
    target = create(:code_resource)

    reference = create(:code_resource_reference,
                       origin: origin,
                       target: target,
                       reference_type: "generic")

    expect(CodeResourceReference.generic).to eq([reference])
  end
end
