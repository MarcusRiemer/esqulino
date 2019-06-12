class User < ApplicationRecord
  has_many :identities

  def self.create_from_hash(auth)
    name = auth[:info][:name] || auth[:info][:nickname]
    create(display_name: name)
  end

  def self.display_name(id)
    where("id = ?", id)
    .limit(1)
    .select("display_name")
  end
end
