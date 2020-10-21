module Seed
  class UserSeed < Base
    # configuration
    # SEED_IDENTIFIER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = User
    SEED_DIRECTORY = "user"

    GUEST_ID = Rails.configuration.sqlino["seed_users"]["guest"]
    SYSTEM_ID = Rails.configuration.sqlino["seed_users"]["system"]

    def after_load_seed
      user = User.find(load_seed_id)

      if (user) then
        if (GUEST_ID.eql? load_seed_id) then
          user.add_role :guest
        elsif (SYSTEM_ID.eql? load_seed_id) then
          user.add_role :admin
        end
      end
    end
  end
end
