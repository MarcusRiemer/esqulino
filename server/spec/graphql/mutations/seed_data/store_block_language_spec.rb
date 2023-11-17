require 'rails_helper'

RSpec.describe Mutations::SeedData::StoreBlockLanguage do
  # These specs rely on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  let(:block_language) do
    FactoryBot.create(:block_language)
  end

  let(:user_admin) do
    user = FactoryBot.create(:user)
    User.make_user_admin!(user.id)
    return user
  end

  def execute_args(user:, block_language_id:)
    {
      operation_name: 'StoreBlockLanguageSeed',
      variables: {
        blockLanguageIds: [block_language_id]
      },
      user:
    }
  end

  context 'forbidden for' do
    it 'guest' do
      expect do
        execute_query(**execute_args(user: User.guest, block_language_id: block_language.id))
      end.to raise_error(Pundit::NotAuthorizedError)
    end

    it 'unrelated registered user' do
      expect do
        execute_query(**execute_args(user: FactoryBot.create(:user), block_language_id: block_language.id))
      end.to raise_error(Pundit::NotAuthorizedError)
    end
  end

  it 'block language with grammar and programming language' do
    res = execute_query(**execute_args(user: user_admin, block_language_id: block_language.id))

    data = res.dig('data', 'storeBlockLanguageSeed')

    expect(data).to include(
      'affectedIds' => [
        [
          hash_including({ 'id' => block_language.id, 'type' => 'BlockLanguageSeed' }),
          hash_including({ 'id' => block_language.grammar.id, 'type' => 'GrammarSeed' }),
          hash_including({ 'id' => block_language.grammar.programming_language.id, 'type' => 'ProgrammingLanguageSeed' })
        ]
      ]
    )
  end
end
