class User < ApplicationRecord

  def self.create_from_hash!(auth)
    create(display_name: auth[:name])
  end
end
