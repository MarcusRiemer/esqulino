class UserRole < ActiveRecord::Base
  self.table_name = "users_roles"

  attr_reader :id

  def id
    return self.user_id
  end
end