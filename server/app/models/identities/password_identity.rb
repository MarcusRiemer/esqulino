class PasswordIdentity < Identity

  def self.create_with_auth(auth, user)
    self.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:data])
  end

  def email
    self.uid
  end

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

  def can_send_verify_mail?
    return waiting_time <= 0
  end

  def reset_token_expired?()
    return self.data["password_reset_token_exp"] < Time.now
  end

  def set_waiting_time
    self.data["waiting_time_verify_mail"] = 2.minutes.from_now
    self.save
  end

  # Waiting time before the server sends a new verify email
  def waiting_time
    need_to_wait = self.data["waiting_time_verify_mail"] || 1.minutes.ago
    return ((need_to_wait.to_time - Time.current) / 1.minute).round
  end


  def password_eql?(password)
    # comparing nil with Password.new(self.data["password"]) will be true
    if password.nil?
      return false
    end
    return Password.new(self.data["password"]) == password
  end

  def confirmed?()
    return self.data["confirmed"]
  end
end