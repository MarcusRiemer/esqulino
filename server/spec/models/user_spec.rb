require 'rails_helper'

RSpec.describe User, type: :model do
  it 'creating a user' do 
    user = build(display_name: 'Tom')
    expect(user).to be_truthy
    expect(user.display_name).to eq('Tom')
  end
end
