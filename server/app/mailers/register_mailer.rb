class RegisterMailer < ApplicationMailer
  def registered_user(user_auth, locale)
    base_url = "#{locale}.#{Rails.configuration.sqlino["editor_domain"]}"
    @user = user_auth
    @user_verify_url = "http://#{base_url}/api/auth/identity/confirmation/#{@user[:data][:verify_token]}"
    mail(to: @user[:data][:email], subject: "Blattwerkzeug.de confirmation")
  end
end