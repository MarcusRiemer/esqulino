class User < ApplicationRecord
  has_many :identities
  validates_length_of :display_name, within: 3..20
  # validates_format_of :display_name, :with => /\A[A-Za-z0-9]*\z/i
  validates_uniqueness_of :email, :allow_nil => true

  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    # If the provider is identity, set the primary email of user to the uid from identity 
    email = (auth[:provider].eql? "identity") ? auth[:uid] : nil

    create(display_name: name, email: email)
  end

  def all_providers()
    return {
      extern: self.all_extern_provider.as_json(:only => [:provider]),
      intern: self.all_intern_provider.as_json(:only => [:provider, :uid, :data]),
      primary: self.email
    }
  end

  def all_extern_provider()
    return PasswordIdentity.all.extern_provider(self.id)
  end

  def all_intern_provider()
    return PasswordIdentity.all.intern_provider(self.id)
                               .select("uid, provider, data ->> 'confirmed' as data")
  end

  def email?
    return !self.email.nil?
  end

  def set_email(email)
    self.email = email
    self.save
  end
end
