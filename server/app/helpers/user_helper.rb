module UserHelper
  include LocaleHelper
  include JwtHelper

  def user_information
    return (private_claim_response || current_user.informations)
  end
end