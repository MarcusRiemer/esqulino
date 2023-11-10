require 'rails_helper'

RSpec.describe 'Project-Policy' do
  let(:project) { create(:project, user: create(:user, :validated)) }

  subject { ProjectPolicy.new(user, project) }

  context 'as guest' do
    let(:user) { create(:user, :guest) }

    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context 'as validated user (but not owner)' do
    let(:user) { create(:user, :validated) }

    it { should permit(:create) }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context 'as validated owner' do
    let(:user) { project.user }

    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context 'as admin' do
    let(:user) { create(:user, :admin) }

    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end
end
