require 'test_helper'

class RenderProjectsControllerTest < ActionDispatch::IntegrationTest
  test 'currently no support for favicons' do
    get 'http://p.sld.tld/favicon.ico'
    assert_response :not_found

    get 'http://p.sld.tld/foo/favicon.ico'
    assert_response :not_found
  end

  test 'db_sequence index page (implicit)' do
    get 'http://db-sequence.sld.tld'
    assert_response :success
    assert_equal "text/html", @response.content_type
  end

  test 'db_sequence page "simple"' do
    get 'http://db-sequence.sld.tld/simple'
    assert_response :success
    assert_equal "text/html", @response.content_type
  end
end
