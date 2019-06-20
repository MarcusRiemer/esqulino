module UserHelper
  include LocaleHelper

  def user_informations
    to_return = {
      logged_in: false
    }
    if signed_in?
      to_return = {
        logged_in: true,
        display_name: @current_user.display_name
      }
    end
    return to_return
  end
end