require 'bcrypt'

module AuthHelper
  include BCrypt
  include UserHelper

  # Creates a simulation of auth data. 
  # The structur is similar to the omniauth reponse.
  # Use case: Register with password
  def create_identity_data(permited_params)
    # If the user is already logged in, 
    # choose the current username and password
    if signed_in?
      # Check if there exists an PasswordIdentity
      # because of a logged in user with other provider
      identity = PasswordIdentity.where(user_id: current_user[:id]).first
      if (identity) then
        name = current_user[:display_name]
        password = identity.password
      end
    end

    return auth = {
      provider: "identity",
      uid: permited_params[:email],
      info: {
        name: (name || permited_params[:username]),
        email: permited_params[:email],
      },
      data: {
        password: (password || permited_params[:password]),
        verify_token: SecureRandom.uuid,
        confirmed: false,
      }
    }
  end
end