require "rails_helper"

RSpec.describe ProjectMailer, :type => :mailer do
  describe "Project Creation" do
    it "Admin Mail" do
      id = "slug"
      name = "Slug Project"
      mail = ProjectMailer.created_admin(id, name)

      expect(mail.subject).to include(name)
      expect(mail.to).to eq([Rails.configuration.sqlino['mail']['admin']])

      expect(mail.body.to_s).to include(name)
      expect(mail.body.to_s).to include(id)
    end
  end
end