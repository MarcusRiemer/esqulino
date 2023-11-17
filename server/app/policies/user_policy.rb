# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def promote_admin?
    user.is_admin?
  end
end
