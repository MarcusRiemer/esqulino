require 'rails_helper'

RSpec.describe Role, type: :model do
  it 'permits valid name' do
    r = FactoryBot.build(:role, name: :admin)
    expect(r).to be_valid
  end

  it 'rejects duplicate names' do
    FactoryBot.create(:role, name: :admin)
    r = FactoryBot.build(:role, name: :admin)
    expect(r).to_not be_valid
  end

  it 'rejects invalid names' do
    r = FactoryBot.build(:role, name: :invalid)
    expect(r).to_not be_valid
  end
end
