require 'rails_helper'

RSpec.describe 'News-Policy' do
  subject { NewsPolicy.new(user, news) }

  let(:news) { create(:news) }

  context 'as guest' do
    let(:user) { create(:user, :guest) }

    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
  end

  context 'as user' do
    let(:user) { create(:user) }

    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
  end

  context 'as admin' do
    let(:user) { create(:user, :admin) }

    it { should permit(:create) }
    it { should permit(:update) }
    it { should permit(:destroy) }
  end

  context 'as owner' do
    let(:user) { news.user }

    it { should_not permit(:create) }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context 'as news_editor' do
    let(:user) do
      u = create(:user)
      u.add_role(:news_editor)

      return u
    end

    it { should permit(:create) }
    it { should permit(:update) }
    it { should_not permit(:destroy) }
  end
end
