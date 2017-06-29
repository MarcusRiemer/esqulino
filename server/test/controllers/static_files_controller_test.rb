require 'test_helper'

class StaticFilesControllerTest < ActionDispatch::IntegrationTest
  test "should get index variations" do
    get '/'
    assert_response :success
  end

end
