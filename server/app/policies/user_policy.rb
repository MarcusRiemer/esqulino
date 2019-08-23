class UserPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def change_roles?
    user.is_admin? && (not record.is_admin?)
  end
end