
require 'bcrypt'

class Identity < ActiveRecord::Base
  include BCrypt
  include LocaleHelper

  attr_accessor :password, :password_confirmation

  belongs_to :user

  scope :developer, -> { where(type: 'Developer') }
  scope :google, -> { where(type: 'Google') }
  scope :password, -> { where(type: 'PasswordIdentity') }
  scope :github, -> { where(type: 'Github') }

  def self.search(auth)
    find_by_provider_and_uid(auth[:provider], auth[:uid])
  end
end

