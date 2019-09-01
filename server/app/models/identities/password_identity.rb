# Bcrypt is used to encrypt passwords
require 'bcrypt'

class PasswordIdentity < Identity
  attr_accessor :password, :password_confirmation

  validates :password, presence: true, :length => { :minimum => 6 }
  # The uid is always the e-mail
  validates_uniqueness_of :uid

  # Search for all password identities with the given email
  def self.find_by_email(email)
    where(uid: email)
  end

  # Search for all password identities with the given token.
  # Verification token is set only in the password identity.
  def self.find_by_verify_token(token)
    where("own_data ->> 'verify_token' = ?", token)
  end

  # Search for all password identities with the given token.
  # Password reset token is set only in the password identity.
  def self.find_by_password_reset_token(token)
    where("own_data ->> 'password_reset_token' = ?", token)
  end

  # Creates a password identity with the given hash and user
  # The auth hash is split into two different jsonb attributes
  # provider_data 
  def self.create_with_auth(auth, user)
    new(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info], :own_data => auth[:data])
  end

  def self.client_information
    return ({
      name: "E-Mail",
      icon: "fa-envelope-o",
      color: "Maroon"
    })
  end

  # Ensure that the data hash is never nil
  after_initialize do |identity|
    # Sadly this is not sufficient: The "password" attribute may
    # be set **during** construction and therefore does this check again
    identity.own_data ||= Hash.new

    # Set the correct provider
    identity.provider = "identity"
    if (identity.valid?) then
      # Ensure that the password is hashed
      identity.ensure_password_hashed!
    end
  end

  def email
    return self.uid
  end

  def reset_token_eql?(token)
    return self.own_data["password_reset_token"].eql? token
  end

  def can_send_verify_mail?
    return waiting_time <= 0
  end

  def reset_token_expired?()
    return self.own_data["password_reset_token_exp"] < Time.now
  end

  def password
    self.own_data["password"]
  end

  def verify_token()
    return self.own_data["verify_token"]
  end

  def password_reset_token()
    return self.own_data["password_reset_token"]
  end

  # Waiting time before the server sends a new verify email
  def waiting_time
    need_to_wait = self.own_data["waiting_time_verify_mail"] || 1.minutes.ago
    return ((need_to_wait.to_time - Time.current) / 1.minute).round
  end

  def confirmed?()
    return self.own_data["confirmed"]
  end

  def confirmed!()
    self.own_data["confirmed"] = true;
  end

  def password=(password)
    # Ugly: All attributes that are actually defined in `self.data` may
    # stumble over a hash that does not yet exist
    self.own_data ||= Hash.new
    self.own_data["password"] = password
  end

  def set_all_passwords(password)
    identities = PasswordIdentity.where('user_id = ?', self.user_id)
    identities.each do |identity|
      identity.password = password
      if (identity.invalid?) then
        raise EsqulinoError.new(identity.errors.full_messages[0])
      end
      identity.save!
    end
  end

  def ensure_password_hashed!
    if (not password.nil?) and (not Password.valid_hash? password) then
      self.own_data["password"] = Password.create(password)
    end
  end

  def set_reset_token_expired()
    self.own_data["password_reset_token_exp"] = Time.now - 1.hour
  end

  def set_reset_token()
    self.own_data["password_reset_token"] = SecureRandom.uuid
    self.own_data["password_reset_token_exp"] = 30.minutes.from_now
  end

  def set_waiting_time
    self.own_data["waiting_time_verify_mail"] = 2.minutes.from_now
  end

  def change_password(permited_params)
    begin
      if (not self.password_eql?(permited_params[:new_password])) then
        if (not self.password_eql?(permited_params[:current_password])) then
          raise EsqulinoError.new("current password is wrong.")
        end

        self.set_all_passwords(permited_params[:new_password])
        IdentityMailer.changed_password(self).deliver unless Rails.env.test?
      end
    rescue EsqulinoError => e
      raise EsqulinoError.new(e.message)
    end
  end

  def email_confirmation
    user = self.user
    if (not user.email?)
      # Sets the primary email on confirmation
      user.email = self.email
    end

    self.confirmed!
    self.save!

    if (user.valid?) then
      user.save!
    end

    return self
  end

  def password_eql?(password)
    ensure_password_hashed!
    # comparing nil with Password.new(self.data["password"]) will be true
    if self.password.blank? || password.blank?
      return false
    else
      Password.new(self.password) == password
    end
  end
end