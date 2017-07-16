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

  test "auth required: updating db-sequence project" do
    project_json = { }

    post '/api/project/db-sequence',
         as: :json,
         params: project_json

    assert_response :unauthorized
  end

  test "updating db-sequence project with partial information" do
    project_json = {
      "apiVersion":"4",
      "name": "changed"
    }

    auth_headers = {"Authorization" => "Basic #{Base64.encode64('user:user')}"}

    post '/api/project/db-sequence',
         as: :json,
         params: project_json,
         headers: auth_headers

    assert_response :success

    get '/api/project/db-sequence'

    assert_response :success
    assert_equal "application/json", @response.content_type

    project = JSON.parse(@response.body)
    assert_equal 'changed', project['name']

    rollback_test_filesystem
  end

  test "updating db-sequence project with unknown information" do
    project_json = {
      "apiVersion":"4",
      "foo": "bar"
    }

    post '/api/project/db-sequence',
         as: :json,
         params: project_json,
         headers: auth_headers

    assert_response :bad_request
  end

  test "creating a new project" do
    project_creation_json = {
      "apiVersion" =>"4",
      "id" => "test-id",
      "name" => "test-name",
      "admin" => {
        "name" => "test-admin",
        "password" => "test-pw",
      },
      "dbType" => "sqlite3"
    }

    post '/api/project',
         as: :json,
         params: project_creation_json

    assert_response :success
    assert_equal "application/json", @response.content_type

    rollback_test_filesystem
  end
end
