# Users are usually real people that have signed up manually. But they may also
# be technical accounts that exist to specify default permissions.
#
# Generally the user model groups together the following information:
# * Social context: How someone would like to be adressed,
#
# TODO: Sort methods, static methods should come first
class User < ApplicationRecord
  # The ID of the user that acts as a guest
  GUEST_ID = Rails.configuration.sqlino["seed_users"]["guest"]

  # Only return true for roles that have been manually added
  # https://github.com/RolifyCommunity/rolify#strict-mode
  rolify strict: true

  # Projects are owned by a user
  has_many :projects
  # Every user can identify himself using multiple identities
  has_many :identities
  # Some users have written news
  has_many :news

  # Only allow safe characters in usernames
  validates_format_of :display_name, :with => /\A^[a-zA-Z0-9]{3}.{0,17}$\z/i
  # Primary emails may only be used once. But because some identities do not
  # provide an email, they may also be empty
  validates_uniqueness_of :email, :allow_nil => true, format: { with: URI::MailTo::EMAIL_REGEXP }

  # The guest user is always present and used to represent users that are
  # currently not logged in. Every role and permission of this user applies
  # to logged out user sessions.
  def self.guest
    self.find(GUEST_ID)
  end

  def self.guest_id
    return GUEST_ID
  end

  # Creates a new user from a hash
  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    # If the provider is identity, set the primary email of user to the uid from identity
    email = auth[:info][:email]

    new(display_name: name, email: email)
  end

  # Searchs for an existing user with the given e-mail
  def self.has_someone_email?(email)
    find_by(email: email) ? true : false
  end


  # During development repeatedly logging in can be tedious. To ease this pain
  # it is possible to simply promote the guest user to be an administator.
  #
  # THIS IS ONLY ALLOWED DURING DEVELOPMENT!
  def self.make_guest_admin!
    if Rails.env.development? or Rails.env.test?
      User.guest.add_role(:admin)
    else
      raise EsqulinoError.new("Guests can't be admins outside of development environments", 401)
    end
  end

  # Promotes the user with the given ID to be an admin.
  def self.make_user_admin!(user_id)
    if (user_id === GUEST_ID)
      User.make_guest_admin!
    else
      user = User.find(user_id)
      user.add_role(:admin)
    end
  end

  # TODO: Should check only the ID, this is what Rails does anyway.
  #       The `eql?` predicate may or may not load `self.guest` via
  #       a DB query, but there is no actual reason to find out.
  def guest?
    return self.eql? self.guest
  end

  # TODO: What is this required for?
  def role_names
    return self.roles.map { |v| v.name }
  end

  # TODO: What is this required for?
  def information
    return  {
      user_id: self.id,
      display_name: self.display_name,
      roles: self.role_names,
      email: self.email
    }
  end

  # TODO: What is this required for?
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
  # TODO: Describe what a "global role" is
  def global_role
    to_return = "guest"
    if (self.has_role? :admin) then
      to_return = "admin"
    elsif (self.has_role? :user) then
      to_return = "user"
    end

    return to_return
  end

  # TODO: What is this required for?
  def primary_email_change?
    identity = self.identities.find { |k| (k.change_primary_email_token) && (not k.primary_email_token_expired?) }
    return identity ? (not identity.email.eql?(self.email)) : false
  end

  # TODO: What is this required for?
  def primary_email_change_time
    identity = self.identities.find { |k| (k.change_primary_email_token) && (not k.primary_email_token_expired?) }
    return identity.change_primary_token_exp
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{display_name}\" (#{id})"
  end
end
