class UserPolicy
  attr_reader :user, :second_user

  def initialize(user, second_user)
    @user = user
    @second_user = second_user
  end

  def change_roles?
    user.is_admin?
  end

  def change_username?
    not user.guest?
  end

  def send_change_email?
    not user.guest?
  end
end