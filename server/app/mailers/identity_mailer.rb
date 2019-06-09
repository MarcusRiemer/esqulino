class IdentityMailer < ApplicationMailer

  @@base_url = Rails.configuration.sqlino["editor_domain"]

  def reset_password(identity_data, locale)
    @identity = identity_data[:data]
    @password_reset_url = "http://#{locale}.#{@@base_url}/user/reset_password?token=#{@identity["password_reset_token"]}&email=#{@identity["email"]}"
    mail(to: @identity["email"], subject: "Blattwerkzeug.de password reset")
  end

  def changed_password(identity_data, display_name)
    @user = identity_data
    mail(to: @user[:data]["email"], subject: "Blattwerkzeug.de password changed")
  end

  def confirm_email(identity_data, locale)
    @user = identity_data
    @user_verify_url = "http://#{locale}.#{@@base_url}/api/identities/confirmation/#{@user[:data][:verify_token]}"
    mail(to: @user[:data][:email], subject: "Blattwerkzeug.de confirmation")
  end
end