# Actual definitions of rake tasks for user administration
namespace :blattwerkzeug do
  namespace :dev do
    # Promote the guest user to be an administrator. This is very useful to simply
    # be almighty during development.
    task :make_guest_admin => :environment do |t, args|
      User.make_guest_admin!
    end
  end
end