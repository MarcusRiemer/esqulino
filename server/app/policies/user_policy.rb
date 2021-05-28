class UserPolicy < ApplicationPolicy
  def promote_admin?
    user.is_admin?
  end
end
