RSpec.describe "Google", type: :model do
  it "can't be persisted without parameters" do
    a = Identity::Google.new
    expect(a.validate).to eq false
  end
end