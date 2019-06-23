class IdentityMailer < ApplicationMailer

  @@base_url = Rails.configuration.sqlino["editor_domain"]

  def reset_password(identity, locale)
    @user = User.find(identity[:user_id])
  
    @password_reset_url = "http://#{locale}.#{@@base_url}/api/identities/reset_password/#{identity[:data]["password_reset_token"]}"
    mail(to: identity[:data]["email"], subject: "Blattwerkzeug.de password reset")
  end

  def changed_password(identity)
    @user = User.find(identity[:user_id])

    @user[:email] ||= identity[:uid]
    mail(to: @user[:email].to_s, subject: "Blattwerkzeug.de password changed")
  end

  def confirm_email(identity, locale)
    @user = User.find(identity[:user_id])

    @user_verify_url = "http://#{locale}.#{@@base_url}/api/identities/confirmation/#{identity[:data]["verify_token"]}"
    mail(to: identity[:uid].to_s, subject: "Blattwerkzeug.de confirmation")
  end
end