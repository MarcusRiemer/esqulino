class PasswordIdentity < Identity
  attr_accessor :email, :name, :password, :password_confirmation

  def confirmed!()
    self.data["confirmed"] = true;
    self.save!
  end

  def set_password_all_with_user_id(password)
    identities = PasswordIdentity.where('user_id = ?', self.user_id)

    identities.each do |identity| 
      identity.set_password(password)
    end
  end

  def set_password(password)
    self.data["password"] = Password.create(password)
    self.save
  end

  def set_reset_token_expired()
    self.data["password_reset_token_exp"] = Time.now - 1.hour
    self.save
  end

  def set_reset_token()
    self.data["password_reset_token"] = SecureRandom.uuid
    self.data["password_reset_token_exp"] = 30.minutes.from_now
    self.save
  end

  def reset_token_eql?(token)
    return self.data["password_reset_token"].eql? token
  end

  def reset_token_expired?()
    return self.data["password_reset_token_exp"] < Time.now
  end

  def password_eql?(password)
    return Password.new(self.data["password"]) == password
  end

  def confirmed?()
    return self.data["confirmed"]
  end
end