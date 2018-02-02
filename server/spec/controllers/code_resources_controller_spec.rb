require 'rails_helper'

RSpec.describe CodeResourcesController, type: :controller do
  describe "CREATE" do
    it "works with only a name and a project_id" do
      proj = FactoryBot.create(:project)
      post :create, :params => { :name => "Any", :project_id => proj.id }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"
    end
  end
end
