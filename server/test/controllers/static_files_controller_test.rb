require 'test_helper'

class StaticFilesControllerTest < ActionDispatch::IntegrationTest
  test "should get index.html for many variations" do
    get '/'
    assert_response :success
    assert_equal "text/html", @response.content_type

    get '/index.html'
    assert_response :success
    assert_equal "text/html", @response.content_type

    get '/about'
    assert_response :success
    assert_equal "text/html", @response.content_type
  end

  test "should get various static assets" do
    get '/vendor/logos/blattwerkzeug-caption.svg'
    assert_response :success
    assert_equal "image/svg+xml", @response.content_type

    get '/vendor/logos/cau.png'
    assert_response :success
    assert_equal "image/png", @response.content_type

  end

  test "should get errors for API endpoints" do
    get '/api/project'
    assert_response 503
  end

end
