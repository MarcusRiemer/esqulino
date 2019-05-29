class User < ApplicationRecord
  has_many :identities

  def self.create_from_hash(auth)
    create(display_name: auth[:info][:name])
  end
end
