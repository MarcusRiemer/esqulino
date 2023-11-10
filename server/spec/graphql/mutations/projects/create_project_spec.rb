require 'rails_helper'

RSpec.describe Mutations::Projects::CreateProject do
  # These specs relies on
  # * an existing guest user
  # * an existing meta grammar language
  before(:each) do
    create(:user, :guest)
    create(:user, :system)
  end

  def init_args(user: User.guest)
    {
      context: {
        user:
      },
      object: nil,
      field: nil
    }
  end

  it 'Creation as guest denied' do
    mut = described_class.new(**init_args)

    expect { mut.resolve(name: { 'en' => 'Test' }) }.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 0
  end

  it 'Creation as admin works' do
    admin = create(:user, :admin)
    mut = described_class.new(**init_args(user: admin))

    result = mut.resolve(name: { 'en' => 'Test' })

    p = Project.find(result[:id])

    expect(p.user_id).to eq admin.id
    expect(p.name).to eq({ 'en' => 'Test' })
  end

  it 'Creation as admin guest ends up as system creation' do
    User.make_guest_admin!

    mut = described_class.new(**init_args)

    result = mut.resolve(name: { 'en' => 'Test' })
    expect(Project.first.user_id).to eq User.system_id
  end
end
