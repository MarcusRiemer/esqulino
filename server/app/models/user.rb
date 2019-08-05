class User < ApplicationRecord

  GUEST_ID = Rails.configuration.sqlino["seed_users"]["guest"]

  rolify strict: true
  has_many :projects
  has_many :identities
  has_many :news

  validates_format_of :display_name, :with => /\A^[a-zA-Z0-9]{3}.{0,17}$\z/i
  validates_uniqueness_of :email, :allow_nil => true

  def self.guest
    self.find(GUEST_ID)
  end

  def self.guest_id
    return GUEST_ID
  end

  def guest?
    return self.eql? self.guest
  end

  def role_names
    return self.roles.map { |v| v.name }
  end

  def informations
    return  {
      user_id: self.id,
      display_name: self.display_name,
      roles: self.role_names,
      email: self.email
    }
  end

  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    # If the provider is identity, set the primary email of user to the uid from identity
    email = auth[:info][:email]

    new(display_name: name, email: email)
  end

  def self.has_email?(email)
    find_by(email: email)
  end

  def all_providers()
    return {
      providers: self.identities.map {|i| i.to_list_api_response },
      primary: self.email
    }
  end

  # Returns all confirmed e-mails of a users
  def all_validated_emails()
    self.identities
      .filter { |i| i.confirmed? }
      .map { |i| i.email }
  end

  # Is current user owner of something
  def owner_of?(instance)
    return instance.owner?(self)
  end

  def email?
    return !self.email.nil?
  end

  # Returns the current global role of a user
  def global_role
    to_return = "guest"
    if (self.has_role? :admin) then
      to_return = "admin"
    elsif (self.has_role? :user) then
      to_return = "user"
    end

    return to_return
  end

  # Sets the primary e-mail of a user
  def set_email(email)
    self.email = email
  end

  def primary_email_change?
    identity = self.identities.find { |k| (k.change_primary_email_token) && (not k.primary_email_token_expired?) }
    return identity ? (not identity.email.eql?(self.email)) : false
  end

  def primary_email_change_time
    identity = self.identities.find { |k| (k.change_primary_email_token) && (not k.primary_email_token_expired?) }
    return identity.change_primary_token_exp
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{display_name}\" (#{id})"
  end
end
