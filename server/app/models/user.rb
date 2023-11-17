# frozen_string_literal: true

# Users are usually real people that have signed up manually. But they may also
# be technical accounts that exist to specify default permissions.
#
# Generally the user model groups together the following information:
# * Social context: How someone would like to be adressed,
#
class User < ApplicationRecord
  # The ID of the user that acts as a guest
  GUEST_ID = Rails.configuration.sqlino[:seed][:users][:guest]

  # The ID of the user that acts as a guest
  SYSTEM_ID = Rails.configuration.sqlino[:seed][:users][:system]

  # Projects are owned by a user
  has_many :projects
  # Every user can identify himself using multiple identities
  has_many :identities, class_name: 'Identity::Identity'
  # Some users have written news
  has_many :news

  # One user can join many projects(Courses)
  has_many :project_members
  has_many :member_at, class_name: 'Project', foreign_key: 'user_id', through: :project_members, source: :project

  # The join table for the roles of this user
  has_many :user_roles

  # The actual roles of this user
  has_many :roles, through: :user_roles

  # Only allow safe characters in usernames
  validates_format_of :display_name, with: /\A[a-zA-Z0-9]{3}[a-zA-Z0-9\ ]{0,17}\z/i
  # Primary emails may only be used once. But because some identities do not
  # provide an email, they may also be empty
  validates_uniqueness_of :email, allow_nil: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  # The guest user is always present and used to represent users that are
  # currently not logged in. Every role and permission of this user applies
  # to logged out user sessions.
  def self.guest
    find(GUEST_ID)
  end

  # The guest user has a static ID
  def self.guest_id
    GUEST_ID
  end

  # The system user has a static ID
  def self.system_id
    SYSTEM_ID
  end

  # Creates a new user from a hash
  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    # If the provider is identity, set the primary email of user to the uid from identity
    email = auth[:info][:email]

    new(display_name: name, email:)
  end

  # Searchs for an existing user with the given e-mail
  def self.has_someone_email?(email)
    find_by(email:) ? true : false
  end

  # During development repeatedly logging in can be tedious. To ease this pain
  # it is possible to simply promote the guest user to be an administator.
  #
  # THIS IS ONLY ALLOWED DURING DEVELOPMENT!
  def self.make_guest_admin!
    raise EsqulinoError::Base.new("Guests can't be admins outside of development environments", 401) unless Rails.env.development? || Rails.env.test?

    User.guest.add_role(:admin)
  end

  # Promotes the user with the given ID to be an admin.
  def self.make_user_admin!(user_id)
    if user_id === GUEST_ID
      User.make_guest_admin!
    else
      user = User.find(user_id)
      user.add_role(:admin)
    end
  end

  def guest?
    id == User.guest_id
  end

  def add_role(role_name)
    role = Role.where(name: role_name.to_s).first_or_create
    user_roles.find_or_create_by(user_id: id, role_id: role.id)
  end

  def has_role?(role_name)
    role_name = role_name.to_s

    raise EsqulinoError::Base.new("Unknown role \"#{role_name}\"", 500, true) unless Role::COMMON_NAMES.include? role_name

    roles.exists?(name: role_name)
  end

  def is_admin?
    has_role?(:admin)
  end

  # Names of the roles of a logged in user
  # Is written in the private claim of the JWT
  def role_names
    roles.pluck('name')
  end

  # The information is used for the clientside representation
  # of a either signed in or signed out user
  def information
    to_return = {
      user_id: id,
      display_name:,
      roles: role_names
    }

    to_return[:email] = email if email?

    to_return
  end

  # The resulting hash will be rendered as json and is used
  # for displaying all linked identities and selected primary email
  def all_providers
    {
      providers: identities.map(&:to_list_api_response),
      primary: email
    }
  end

  # Is current user owner of something
  def owner_of?(instance)
    instance.owner?(self)
  end

  # Returns the current global role of a user
  def global_role
    to_return = 'guest'
    if has_role? :admin
      to_return = 'admin'
    elsif has_role? :user
      to_return = 'user'
    end

    to_return
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{display_name}\" (#{id})"
  end
end
