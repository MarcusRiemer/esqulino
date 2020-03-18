class IdentityPolicy < ApplicationPolicy
  attr_reader :user, :identity

  def initialize(user, identity)
    @user = user
    @identity = identity
  end

  def list?
    true
  end

  def show?
    not user.guest?
  end
end