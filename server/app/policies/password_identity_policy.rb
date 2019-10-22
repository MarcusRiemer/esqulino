class PasswordIdentityPolicy
  attr_reader :user, :identity

  def initialize(user, identity)
    @user = user
    @identity = identity
  end

  def change_password?
    not user.eql?(User.guest) and user.has_confirmed_password_identity?
  end
end