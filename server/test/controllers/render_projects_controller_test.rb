require 'test_helper'

class RenderProjectsControllerTest < ActionDispatch::IntegrationTest
  test 'currently no support for favicons' do
    get 'http://p.sld.tld/favicon.ico'
    assert_response :not_found

    get 'http://p.sld.tld/foo/favicon.ico'
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

  test 'db_sequence page "/param_query?key=1"' do
    get 'http://db-sequence.sld.tld//param_query?key=1'
    assert_response :success
    assert_equal "text/html", @response.content_type

    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'eins', html_doc.at_css('p').text.strip
    assert_equal 'param_query - db-sequence', html_doc.at_css('title').text.strip
  end
  
end
