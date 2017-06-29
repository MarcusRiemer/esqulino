require 'test_helper'

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test "should get all public projects" do
    get '/api/project'
    
    assert_response :success
    assert_equal "application/json", @response.content_type

    projects = JSON.parse(@response.body)

    assert_equal 1, projects.length
    assert_equal 'db_sequence', projects[0]['name']
  end

  test "should get the db_sequence test project" do
    get '/api/project/db_sequence'

    assert_response :success
    assert_equal "application/json", @response.content_type

    project = JSON.parse(@response.body)
    assert_equal 'db_sequence', project['name']
    assert_equal 'db_sequence', project['id'] 
  end

  test "shouldn't have a preview image for db_sequence" do
    get '/api/project/db_sequence/preview'

    assert_response :not_found
  end

end
