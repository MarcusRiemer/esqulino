require 'test_helper'

class ProjectDatabasesControllerTest < ActionDispatch::IntegrationTest
  test 'db_sequence visual schema (various formats)' do
    get '/api/project/db_sequence/db/default/visual_schema'
    assert_response :success
    assert_equal "image/svg+xml", @response.content_type

    get '/api/project/db_sequence/db/default/visual_schema?format=png'
    assert_response :success
    assert_equal "image/png", @response.content_type
  end
end
