
class Identity < ApplicationRecord
  belongs_to :user

  def self.search(auth)
    find_by_provider_and_uid(auth["provider"], auth["uid"])
  end

  def self.create_with_auth(auth, user)
    user ||= User.create_from_hash!(auth)
    Identity.create(:user => user, :uid => auth[:uid], :provider => auth[:provider])
  end
end

