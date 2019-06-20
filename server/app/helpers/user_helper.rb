module UserHelper
  include LocaleHelper

  def user_information
    # Needs to be in the helper, because of current_user
    # you can't acces this method if current_user is nil
    to_return = { logged_in: false }
    if signed_in?
      to_return = {
        logged_in: true,
        display_name: @current_user.display_name
      }
    end
    return to_return
  end
end