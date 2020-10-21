require "rails_helper"

RSpec.describe IdentityMailer, :type => :mailer do
  describe "Identity Mailer" do
    locale = "de"
    display_name = "Blattwerkzeug"
    base_url = Rails.configuration.sqlino["editor_domain"]

    it "reset password" do
      identity = create(:identity_provider, :new)
      mail = IdentityMailer.reset_password(identity, locale)

      expect(mail.subject).to eq("Blattwerkzeug.de password reset")
      expect(mail.to.first).to eq(identity[:uid])

      expect(mail.text_part.body.to_s).to include("https://#{base_url}/user/reset_password/#{identity[:own_data]["password_reset_token"]}")
    end

    it "changed password" do
      identity = create(:identity_provider, :new)
      mail = IdentityMailer.changed_password(identity)

      expect(mail.subject).to eq("Blattwerkzeug.de password changed")
      expect(mail.to.first).to eq(identity[:uid])
    end

    it "confirm email" do
      identity = create(:identity_provider, :new)
      mail = IdentityMailer.confirm_email(identity, locale)

      expect(mail.subject).to eq("Blattwerkzeug.de confirmation")
      expect(mail.to.first).to eq(identity[:uid])

      expect(mail.text_part.body.to_s).to include("https://#{base_url}/api/identities/confirmation/#{identity[:own_data]["verify_token"]}")
    end
  end
end
