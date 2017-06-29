require 'test_helper'

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get '/api/project'
    
    assert_response :success
  end

end
