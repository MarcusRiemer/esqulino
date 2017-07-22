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

  test 'pokemongo index page' do
    get 'http://pokemongo.sld.tld/'

    assert_response :success
    assert_equal "text/html", @response.content_type

    html_doc = Nokogiri::XML(@response.body) do |config|
      config.noblanks
    end

    # Check the table displaying pokemon
    table = html_doc.at_css('table:nth-of-type(1)')
    assert_equal 1, table.count

    # Header of the table
    table_header = table.at_css('thead tr')
    assert_equal 4, table_header.children.length
    assert_equal 'spitzname', table_header.children[0].text
    assert_equal 'name', table_header.children[1].text
    assert_equal 'staerke', table_header.children[2].text
    assert_equal 'typ_name', table_header.children[3].text
  end

  test 'pokemongo individual pokemon pages' do
    (1..5).each do |i|
      get "http://pokemongo.sld.tld/Gefangen_Einzeln?gefangen_id=#{i}"
      assert_response :success
      assert_equal "text/html", @response.content_type
    end
  end

  test 'pokemongo crud pokemon' do
    # Check that Pokemon #6 does not currently exist
    get "http://pokemongo.sld.tld/Gefangen_Einzeln?gefangen_id=6"
    assert_response :bad_request
    
    # Create pokemon #6
    post 'http://pokemongo.sld.tld/Gefangen_Neu/query/79f9fd59-89cd-47d1-ab20-9a4388cd9d44',
         params: {
           'nummer'	=> '1',
           'name'	=> 'test',
           'staerke' =>	'100'
         },
         as: :form,
         headers: auth_headers

    assert_response :found

    # Ensure it exists
    get "http://pokemongo.sld.tld/Gefangen_Einzeln?gefangen_id=6"
    assert_response :success
    assert_equal "text/html", @response.content_type

    # Delete it again
    post 'http://pokemongo.sld.tld/Hauptseite/query/40bddeac-facc-4836-a27b-6a23222078d5',
         params: {
           'gefangen_id' => '6'
         },
         as: :form,
         headers: auth_headers

    # Check that Pokemon #6 does not currently exist
    get "http://pokemongo.sld.tld/Gefangen_Einzeln?gefangen_id=6"
    assert_response :bad_request
    
    rollback_test_filesystem
  end

  test 'pokemengo create captured without number' do
    post 'http://pokemongo.sld.tld/Gefangen_Neu/query/79f9fd59-89cd-47d1-ab20-9a4388cd9d44',
         params: {
           'name'	=> 'test',
           'staerke' =>	'100'
         },
         as: :form,
         headers: auth_headers

    assert_response :bad_request
  end
  
end
