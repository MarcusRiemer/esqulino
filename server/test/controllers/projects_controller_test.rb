require 'test_helper'

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test "should get all public projects" do
    get '/api/project'
    
    assert_response :success
    assert_equal "application/json", @response.content_type

    projects = JSON.parse(@response.body)

    assert_equal 1, projects.length
    assert_equal 'db-sequence', projects[0]['name']
  end

  test "should get the db-sequence test project" do
    get '/api/project/db-sequence'

    assert_response :success
    assert_equal "application/json", @response.content_type

    project = JSON.parse(@response.body)
    assert_equal 'db-sequence', project['name']
    assert_equal 'db-sequence', project['id'] 
  end

  test "shouldn't have a preview image for db-sequence" do
    get '/api/project/db-sequence/preview'

    assert_response :not_found
  end

  test "invalid: updating db-sequence project without a name" do
    project_json = {
      "apiVersion":"4",
      "description":"test-description"
    }

    post '/api/project/db-sequence',
         as: :json,
         params: project_json
  end

end
