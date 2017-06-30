require 'test_helper'

class ProjectDatabasesControllerTest < ActionDispatch::IntegrationTest
  test 'db_sequence visual schema (running graphviz)' do
    get '/api/project/db_sequence/db/default/visual_schema'
    assert_response :success
    assert_equal "image/svg+xml", @response.content_type

    get '/api/project/db_sequence/db/default/visual_schema?format=png'
    assert_response :success
    assert_equal "image/png", @response.content_type
  end

  test 'db_sequence visual schema (without running graphviz)' do
    get '/api/project/db_sequence/db/default/visual_schema?format=graphviz'
    assert_response :success
    assert_equal "text", @response.content_type
  end

  test 'db_sequence rowcount on default database' do
    get '/api/project/db_sequence/db/default/count/key_value'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [5], result
  end

  test 'db_sequence first row of default database' do
    get '/api/project/db_sequence/db/default/rows/key_value/0/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, 'eins']], result
  end

  test 'db_sequence second row of default database' do
    get '/api/project/db_sequence/db/default/rows/key_value/1/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[2, 'zwei']], result
  end

  test 'db_sequence rowcount on english database' do
    get '/api/project/db_sequence/db/with_english/count/english_numbers'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [2], result
  end

  test 'db_sequence first row of english database' do
    get '/api/project/db_sequence/db/with_english/rows/english_numbers/0/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, 'one']], result
  end

  test 'db_sequence second row of english database' do
    get '/api/project/db_sequence/db/with_english/rows/english_numbers/1/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[2, 'two']], result
  end

  test 'db_sequence rowcount for unknown table' do
    get '/api/project/db_sequence/db/default/count/foobar'
    assert_response :not_found
  end

  
end
