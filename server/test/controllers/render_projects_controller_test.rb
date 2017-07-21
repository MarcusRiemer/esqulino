require 'test_helper'

class RenderProjectsControllerTest < ActionDispatch::IntegrationTest
  test 'currently no support for favicons' do
    get 'http://p.sld.tld/favicon.ico'
    assert_response :not_found

    get 'http://p.sld.tld/foo/favicon.ico'
    assert_response :not_found
  end

  test 'accessing vendor files' do
    get 'http://p.sld.tld/vendor/css/bootstrap.css'
    assert_response :success

    get 'http://p.sld.tld/vendor/css/esqulino-ribbon.css'
    assert_response :success

    get 'http://p.sld.tld/vendor/css/pink-fluffy-imaginary-unicorn.css'
    assert_response :not_found
  end

  test 'db_sequence page index (implicit)' do
    get 'http://db-sequence.sld.tld'
    assert_response :success
    assert_equal "text/html", @response.content_type
  end

  test 'db_sequence page "/simple"' do
    get 'http://db-sequence.sld.tld/simple'
    assert_response :success
    assert_equal "text/html", @response.content_type

    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'Header 1', html_doc.at_css('h1').text.strip
    assert_equal 'simple - db-sequence', html_doc.at_css('title').text.strip
  end

  test 'db_sequence page "/simple_query"' do
    get 'http://db-sequence.sld.tld/simple_query'
    assert_response :success
    assert_equal "text/html", @response.content_type

    html_doc = Nokogiri::HTML(@response.body)
    assert_equal '1', html_doc.at_css('p').text.strip
    assert_equal 'simple_query - db-sequence', html_doc.at_css('title').text.strip
  end

  test 'db_sequence page "/param_query?wert=1"' do
    get 'http://db-sequence.sld.tld/param_query?wert=1'
    assert_response :success
    assert_equal "text/html", @response.content_type

    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'eins', html_doc.at_css('p').text.strip
    assert_equal 'param_query - db-sequence', html_doc.at_css('title').text.strip
  end

  test 'cyoa index page' do
    get 'http://cyoa.sld.tld'
    assert_response :success
    assert_equal "text/html", @response.content_type
  end

  test 'cyoa all chapter pages' do
    # The adventure has seven chapters, we test each chapter individually
    (1..7).each do |i|
      get "http://cyoa.sld.tld/Kapitel?nummer=#{i}"
      assert_response :success
      assert_equal "text/html", @response.content_type
    end
  end
  
end
