require 'test_helper'

class ProjectImagesControllerTest < ActionDispatch::IntegrationTest
  test 'access metadata of an existing image' do
    get '/api/project/db_sequence/image/9727a106-626d-4df4-b8a6-f6ca7714f781/metadata'

    assert_response :success
    # assert_equal "application/json", @response.content_type
    # image = JSON.parse(@response.body)
    # assert_equal 'foo', image['name']
  end
end
