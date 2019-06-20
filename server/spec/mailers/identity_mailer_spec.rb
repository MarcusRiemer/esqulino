require "rails_helper"

RSpec.describe IdentityMailer, :type => :mailer do
  let(:user) { create(:user) }
  
  describe "Identity Mailer" do
    locale = "de"
    display_name = "Blattwerkzeug"
    base_url = Rails.configuration.sqlino["editor_domain"]
    let(:identity) { create(:identity, :identity_provider, user_id: user[:id]) }

    it "reset password" do
      mail = IdentityMailer.reset_password(identity, locale)

      expect(mail.subject).to eq("Blattwerkzeug.de password reset")
      expect(mail.to).to eq(identity["email"])

      expect(mail.body.to_s).to include("http://#{locale}.#{base_url}/user/reset_password?token=#{identity["password_reset_token"]}&email=#{@identity["email"]}")
    end

    it "changed password" do
      mail = IdentityMailer.changed_password(identity)

      expect(mail.subject).to eq("Blattwerkzeug.de password changed")
      expect(mail.to).to eq(identity["email"])
    end

    it "confirm email" do
      mail = IdentityMailer.changed_password(identity, locale)

      expect(mail.subject).to eq("Blattwerkzeug.de confirmation")
      expect(mail.to).to eq(identity["email"])

      expect(mail.body.to_s).to include("http://#{locale}.#{base_url}/api/identities/confirmation/#{identity[:data][:verify_token]}")
    end
  end
end