require 'rails_helper'

RSpec.describe Mutations::SeedData::StoreProject do
  # These specs rely on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  let(:project) do
    FactoryBot.create(:project)
  end

  let(:user_admin) do
    user = FactoryBot.create(:user)
    User.make_user_admin!(user.id)
    return user
  end

  def execute_args(user:, project_id:)
    {
      operation_name: 'StoreProjectSeed',
      variables: {
        projectIds: [project_id]
      },
      user:
    }
  end
  context 'forbidden for' do
    it 'guest' do
      expect do
        execute_query(**execute_args(user: User.guest, project_id: project.id))
      end.to raise_error(Pundit::NotAuthorizedError)
    end

    it 'unrelated registered user' do
      expect do
        execute_query(**execute_args(user: FactoryBot.create(:user), project_id: project.id))
      end.to raise_error(Pundit::NotAuthorizedError)
    end

    it 'owner' do
      expect do
        execute_query(**execute_args(user: project.user, project_id: project.id))
      end.to raise_error(Pundit::NotAuthorizedError)
    end
  end

  it 'project without resources' do
    res = execute_query(**execute_args(user: user_admin, project_id: project.id))

    data = res.dig('data', 'storeProjectSeed')

    expect(data).to include({
                              'affectedIds' => [
                                [hash_including({ 'id' => project.id, 'type' => 'ProjectSeed' })]
                              ]
                            })
  end

  it 'project without code resource' do
    code = FactoryBot.create(:code_resource, project:)
    uses = project.project_uses_block_languages.first
    res = execute_query(**execute_args(user: user_admin, project_id: project.id))

    data = res.dig('data', 'storeProjectSeed')
    expect(data).to include({
                              'affectedIds' => [
                                [
                                  hash_including({ 'id' => project.id, 'type' => 'ProjectSeed' }),
                                  hash_including({ 'id' => uses.id, 'type' => 'ProjectUsesBlockLanguageSeed' }),
                                  hash_including({ 'id' => code.id, 'type' => 'CodeResourceSeed' })
                                ]
                              ]
                            })
  end
end
