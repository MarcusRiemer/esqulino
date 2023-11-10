# Actual definitions of rake tasks for user administration
namespace :blattwerkzeug do
  namespace :dev do
    # Promote the guest user to be an administrator. This is very useful to simply
    # be almighty during development.
    task make_guest_admin: :environment do |_t, _args|
      User.make_guest_admin!
    end
  end

  # Promote the given user to be an administrator
  task :make_admin, [:user_id] => :environment do |_t, args|
    User.make_user_admin! args[:user_id]
  end
end
