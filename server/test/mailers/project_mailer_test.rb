require 'test_helper'

class ProjectMailerTest < ActionMailer::TestCase
  test "new project created - admin mail" do
    email = ProjectMailer.created_admin('test-id', 'test-name')

    assert_emails 1 do
      email.deliver_now
    end
  end
end
