module UserHelper
  include LocaleHelper

  def user_information
    # Needs to be in the helper, because of current_user
    # you can't acces this method if current_user is nil
    to_return = {
      logged_in: false
    }
    if signed_in?
      role = @token_decoded ? (@token_decoded[:global_role] || @current_user.global_role) : @current_user.global_role
      to_return = {
        logged_in: true,
        display_name: @current_user.display_name,
        role: role
      }
    end
    return to_return
  end
end