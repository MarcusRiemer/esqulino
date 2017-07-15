require 'simplecov'
SimpleCov.start 'rails'

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  
  # Reverts all changes that have been made to the filesystem
  # to the state that is known to git  
  def rollback_test_filesystem
    git_root = Rails.root.join '..'
    system "make -C #{git_root} test-reset", :out => File::NULL
  end

  def auth_headers
    {"Authorization" => "Basic #{Base64.encode64('user:user')}"}
  end
end
