class User < ApplicationRecord
  include IdentityHelper

  has_many :identities
  validates_length_of :display_name, within: 3..20
  # validates_format_of :display_name, :with => /\A[A-Za-z0-9]*\z/i
  validates_uniqueness_of :email, :allow_nil => true

  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    # If the provider is identity, set the primary email of user to the uid from identity
    email = auth[:info][:email]

    create(display_name: name, email: email)
  end

  def all_providers()
    return {
      providers: Identity.all.map {|i| i.to_list_api_response },
      primary: self.email
    }
  end

  def email?
    return !self.email.nil?
  end

  def set_email(email)
    self.email = email
    self.save
  end
end
