class User < ApplicationRecord
  has_many :identities

  def self.create_from_hash(auth)
    create(display_name: auth[:info][:name])
  end

  def self.display_name(id)
    where("id = ?", id)
    .limit(1)
    .select("display_name")
  end
end
