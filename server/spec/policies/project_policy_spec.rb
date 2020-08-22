require 'rails_helper'

RSpec.describe "Project-Policy" do
  let(:project) { create(:project) }

  subject { ProjectPolicy.new(user, project) }

  context "as guest" do
    let(:user) { create(:user, :guest) }

    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it { should_not permit(:list_all) }
  end

  context "as user (but not owner)" do
    let(:user) { create(:user) }

    it { should permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it { should_not permit(:list_all) }
  end

  context "as owner" do
    let(:user) { project.user }

    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
    it { should_not permit(:list_all) }
  end

  context "as admin" do
    let(:user) { create(:user, :admin) }

    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
    it { should permit(:list_all) }
  end
end