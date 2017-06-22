require 'test_helper'

class StaticFilesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get static_files_index_url
    assert_response :success
  end

end
