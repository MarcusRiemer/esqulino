require 'rails_helper'

RSpec.describe CodeResourceReference, type: :model do
  it 'Generic reference' do
    origin = create(:code_resource)
    target = create(:code_resource)

    reference = create(:code_resource_reference,
                       origin:,
                       target:)

    expect(origin.targeted_code_resources).to match_array [target]
  end
end
