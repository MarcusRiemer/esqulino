require 'test_helper'

class ProjectDatabasesControllerTest < ActionDispatch::IntegrationTest
  test 'db-sequence visual schema (running graphviz)' do
    skip
    get '/api/project/db-sequence/db/default/visual_schema'
    assert_response :success
    assert_equal "image/svg+xml", @response.content_type

    get '/api/project/db-sequence/db/default/visual_schema?format=png'
    assert_response :success
    assert_equal "image/png", @response.content_type
  end

  test 'db-sequence visual schema (without running graphviz)' do
    skip
    get '/api/project/db-sequence/db/default/visual_schema?format=graphviz'
    assert_response :success
    assert_equal "text", @response.content_type
  end

  test 'db-sequence rowcount on default database' do
    skip
    get '/api/project/db-sequence/db/default/count/key_value'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [5], result
  end

  test 'db-sequence first row of default database' do
    skip
    get '/api/project/db-sequence/db/default/rows/key_value/0/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, 'eins']], result
  end

  test 'db-sequence second row of default database' do
    skip
    get '/api/project/db-sequence/db/default/rows/key_value/1/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[2, 'zwei']], result
  end

  test 'db-sequence rowcount on english database' do
    skip
    get '/api/project/db-sequence/db/with_english/count/english_numbers'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [2], result
  end

  test 'db-sequence first row of english database' do
    skip
    get '/api/project/db-sequence/db/with_english/rows/english_numbers/0/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[1, 'one']], result
  end

  test 'db-sequence second row of english database' do
    skip
    get '/api/project/db-sequence/db/with_english/rows/english_numbers/1/1'
    assert_response :success
    assert_equal "application/json", @response.content_type

    result = JSON.parse(@response.body)
    assert_equal [[2, 'two']], result
  end

  test 'db-sequence rowcount for unknown table' do
    skip
    get '/api/project/db-sequence/db/default/count/foobar'
    assert_response :not_found
  end

  test 'db-sequence adding column to key_value' do
    skip
    
    commands = {
      "commands" => [
        {
          "type":"addColumn",
          "index":0
        },
        {
          "type":"renameColumn",
          "index":1,
          "columnIndex":2,
          "newName":"test",
          "oldName":"New_Column"
        }
      ]
    }

    post '/api/project/db-sequence/db/default/alter/key_value',
         as: :json,
         params: commands,
         headers: auth_headers

    assert_response :success
    assert_equal "application/json", @response.content_type

    
    result = JSON.parse(@response.body)
    result_table = result['schema'][0]
    assert_equal 'key_value', result_table['name']
    assert_equal 'key', result_table['columns'][0]['name']
    assert_equal 'value', result_table['columns'][1]['name']
    assert_equal 'test', result_table['columns'][2]['name']

    rollback_test_filesystem
  end
  
end
