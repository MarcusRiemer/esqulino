# coding: utf-8
require 'nokogiri'

require 'test_helper'

class ProjectQueriesControllerTest < ActionDispatch::IntegrationTest
  test "sequence_db: running a stored SELECT query (no params)" do
    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"]], result['rows']
  end

  test "sequence_db: running a dynamic SELECT query (no params)" do
    post '/api/project/db-sequence/query/run',
         params: {
           sql: 'SELECT * FROM key_value WHERE key_value.key = key_value.key',
           params: Hash.new
         },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"]], result['rows']
  end

  test "sequence_db: running a stored INSERT query (no params)" do
    post '/api/project/db-sequence/query/e7273c53-bb78-44b0-95fd-8a716948a9b4/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"], [6, "test"]], result['rows']

    rollback_test_filesystem
  end

  test "sequence_db: simulating a dynamic INSERT query (no params)" do
    post '/api/project/db-sequence/query/simulate/insert',
         params: {
           sql: 'INSERT INTO key_value (value) VALUES (\'test\')',
           params: Hash.new
         },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal ["key", "value"], result['columns']
    assert_equal [[6, "test"]], result['inserted']

    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"]], result['rows']
  end
  
  test "sequence_db: running a dynamic INSERT query (no params)" do
    post '/api/project/db-sequence/query/run',
         params: {
           sql: 'INSERT INTO key_value (value) VALUES (\'test\')',
           params: Hash.new
         },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"], [6, "test"]], result['rows']

    rollback_test_filesystem
  end

  
  test "sequence_db: running a stored SELECT query with too many parameters" do
    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { 'foo' => 'bar' },
         as: :json

    assert_response :bad_request
  end

  test "sequence_db: running a stored SELECT query with required parameters" do
    post '/api/project/db-sequence/query/a0495663-6fd3-42b2-8167-acfebe778ed5/run',
         params: { 'wert' => '3' },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[3, "drei"]], result['rows']
  end

  test "sequence_db: running a stored SELECT query with missing parameters" do
    post '/api/project/db-sequence/query/a0495663-6fd3-42b2-8167-acfebe778ed5/run',
         params: { },
         as: :json
    
    assert_response :bad_request
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal ['wert'], result['requiredParameters'], "Required Parameters"
    assert_equal Hash.new, result['availableParameters'], "Available Parameters"
  end

  test "sequence_db: running a stored SELECT query with missing and too many parameters" do
    post '/api/project/db-sequence/query/a0495663-6fd3-42b2-8167-acfebe778ed5/run',
         params: { 'foo' => 'bar' },
         as: :json
    
    assert_response :bad_request
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal(['wert'], result['requiredParameters'], "Required Parameters")
    assert_equal({ 'foo' => 'bar' }, result['availableParameters'], "Available Parameters")
  end

  test "sequence_db: simulating a dynamic DELETE query (no params)" do
    # Simulate deletion of first row
    post '/api/project/db-sequence/query/simulate/delete',
         params: {
           sql: 'DELETE FROM key_value WHERE key_value.key = 1',
           params: Hash.new
         },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal ["key", "value"], result['columns']
    assert_equal [[1, "eins"]], result['rows']

    # Ensure nothing has changed
    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"]], result['rows']
  end
end
