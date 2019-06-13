class User < ApplicationRecord
  has_many :identities

  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    create(display_name: name)
  end

end
