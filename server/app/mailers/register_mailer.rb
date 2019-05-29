class RegisterMailer < ApplicationMailer
  def registered_user(user_data)
    @user = user_data
    @user_verify_url = `http://#{}/api/auth/identity/verify/#{@user[:verify_token]}`
    mail(to: @user[:email], subject: "Blattwerkzeug.de verify token")
  end
end