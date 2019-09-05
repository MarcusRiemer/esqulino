class UserMailer < ApplicationMailer

  @@base_url = Rails.configuration.sqlino["editor_domain"]

  def change_primary_email(identity, locale)
    @user = User.find(identity[:user_id])

    @user[:email] ||= identity[:uid]
    @change_primary_email = "https://#{@@base_url}/api/user/change_primary_email/#{identity.change_primary_email_token}"
    mail(to: @user[:email], subject: "Blattwerkzeug.de change primary email")
  end
end