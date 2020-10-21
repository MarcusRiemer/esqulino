require 'rails_helper'

RSpec.describe "News-Policy" do
  subject { NewsPolicy.new(user, news) }

  let(:news) { create(:news) }

  context "as guest" do
    let(:user) { create(:user, :guest) }

    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
  end

  context "as user" do
    let(:user) { create(:user) }

    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
  end

  context "as admin" do
    let(:user) { create(:user, :admin) }

    it { should permit(:create) }
    it { should permit(:update) }
    it { should permit(:destroy) }
  end

  context "as owner" do
    let(:user) { news.user }

    it { should_not permit(:create) }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context "as user with update permission" do
    let(:user) {
      create(:user, roles: [
               Role.find_or_create_by(name: :news_editor, resource: news)
             ])
    }

    it { should_not permit(:create) }
    it { should permit(:update) }
    it { should_not permit(:destroy) }
  end
end
