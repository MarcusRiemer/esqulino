class PasswordIdentity < Identity
  attr_accessor :password, :password_confirmation

  validates :password, presence: true

  def self.create_with_auth(auth, user)
    new(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:data])
  end

  # Ensure that the data hash is never nil
  after_initialize do |identity|
    # Sadly this is not sufficient: The "password" attribute may
    # be set **during** construction and therefore does this check again
    identity.data ||= Hash.new

    # Set the correct provider
    identity.provider = "identity"

    # Ensure that the password is hashed
    identity.ensure_password_hashed!
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
      identity.save!
    end
  end

  def ensure_password_hashed!
    if (not password.nil?) and (not Password.valid_hash? password) then
      self.data["password"] = Password.create(password)
    end
  end

  def password
    self.data["password"]
  end

  def password=(password)
    # Ugly: All attributes that are actually defined in `self.data` may
    # stumble over a hash that does not yet exist
    self.data ||= Hash.new

    # Is the given password already encrypted?
    if Password.valid_hash? password then
    # Yes, don't encrypt it again
      self.data["password"] = password
    else
      # No, encrypt it
      self.data["password"] = Password.create(password)
    end


    self.save
  end

  def set_password(password)
    self.password = password
  end

  def set_reset_token_expired()
    self.data["password_reset_token_exp"] = Time.now - 1.hour
  end

  def set_reset_token()
    self.data["password_reset_token"] = SecureRandom.uuid
    self.data["password_reset_token_exp"] = 30.minutes.from_now
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
  end

  # Waiting time before the server sends a new verify email
  def waiting_time
    need_to_wait = self.data["waiting_time_verify_mail"] || 1.minutes.ago
    return ((need_to_wait.to_time - Time.current) / 1.minute).round
  end


  def password_eql?(password)
    # comparing nil with Password.new(self.data["password"]) will be true
    if self.password.blank? || password.blank?
      return false
    else
      return Password.new(self.password) == password
    end
  end

  def confirmed?()
    return self.data["confirmed"]
  end
end