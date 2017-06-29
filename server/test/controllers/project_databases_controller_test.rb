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

  test 'db_sequence rowcount' do
    get '/api/project/db_sequence/db/default/count/key_value'
    assert_equal "application/json", @response.content_type
    assert_response :success
  end

  test 'db_sequence rowcount for unknown table' do
    get '/api/project/db_sequence/db/default/count/foobar'
    assert_response :not_found
  end

  
end
