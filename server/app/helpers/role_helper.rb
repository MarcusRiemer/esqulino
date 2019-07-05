module RoleHelper
  include LocaleHelper

  def global_role
    @current_user.roles
  end

end