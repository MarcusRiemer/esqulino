# coding: utf-8
require 'nokogiri'

require 'test_helper'

class ProjectQueriesControllerTest < ActionDispatch::IntegrationTest
  test "sequence_db: running a stored SELECT query" do
    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, "eins"], [2, "zwei"], [3, "drei"], [4, "vier"], [5, "fünf"]], result
  end
  
  test "sequence_db: running a stored SELECT query with too many parameters" do
    post '/api/project/db-sequence/query/f3de342b-45ce-438b-b977-ad5b177d393d/run',
         params: { 'foo' => 'bar' },
         as: :json

    assert_response :bad_request
  end

  test "sequence_db: running a stored SELECT query with required parameters" do
    post '/api/project/db-sequence/query/a0495663-6fd3-42b2-8167-acfebe778ed5/run',
         params: { 'wert' => 'drei' },
         as: :json

    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[3, "drei"]], result
  end

  test "sequence_db: running a stored SELECT query with missing parameters" do
    post '/api/project/db-sequence/query/a0495663-6fd3-42b2-8167-acfebe778ed5/run',
         params: { },
         as: :json

    # TODO: This should actually result in an error, but because
    # the Sinatra-application did not treat this as an error, we leave
    # the behaviour as it is for the moment.
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [], result
  end
end
