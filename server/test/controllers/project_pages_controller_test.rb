require 'test_helper'

class ProjectPagesControllerTest < ActionDispatch::IntegrationTest
  test "render arbitrary - static heading" do
    html_in = <<~END
      <!DOCTYPE html>
      <html>
        <head>
          <title>head</title>
        </head>
        <body>
          <h1>Header 1</h1>
        </body>
      </html>
    END

    body_in = {
      "sourceType" => "liquid",
      "source" => html_in,
      "page" => {
        "id" => "159ba814-445d-4167-a483-e3fc0db85cae",
        "name" => "Simple",
        "apiVersion" => "4",
        "body" => {
          "type" => "body",
          "children" => [
            {
              "type" => "heading",
              "level" => 1,
              "text" => "Header 1"
            }
          ]
        }
      },
      "queries" => [],
      "params" => {}
    }
    
    post '/api/project/db_sequence/page/render',
         as: :json,
         params: body_in
    
    assert_response :success
    assert_equal "text/plain", @response.content_type

    # Ensure that the basic document structure is correct    
    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'Header 1', html_doc.at_css('h1').text.strip
    assert_equal 'head', html_doc.at_css('title').text.strip
  end

  test "render arbitrary - dynamic heading" do
    html_in = <<~END
      <!DOCTYPE html>
      <html>
        <head>
          <title>{{ page.name }} - {{ project.name }}</title>
        </head>
        <body>
          <h1>{{ page.name }}</h1>
        </body>
      </html>
    END

    body_in = {
      "sourceType" => "liquid",
      "source" => html_in,
      "page" => {
        "id" => "159ba814-445d-4167-a483-e3fc0db85cae",
        "name" => "dynamic",
        "apiVersion" => "4",
        "body" => {
          "type" => "body",
          "children" => [
            {
              "type" => "heading",
              "level" => 1,
              "text" => "{{ page.name }}"
            }
          ]
        }
      },
      "queries" => [],
      "params" => {}
    }
    
    post '/api/project/db_sequence/page/render',
         as: :json,
         params: body_in
    
    assert_response :success
    assert_equal "text/plain", @response.content_type

    # Ensure that the basic document structure is correct    
    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'dynamic', html_doc.at_css('h1').text.strip
    assert_equal 'dynamic - db_sequence', html_doc.at_css('title').text.strip
  end

  test 'render known - simple heading' do
    get '/api/project/db_sequence/page/159ba814-445d-4167-a483-e3fc0db85cae/render'

    assert_response :success
    assert_equal "text/plain", @response.content_type

    # Ensure that the basic document structure is correct    
    html_doc = Nokogiri::HTML(@response.body)
    assert_equal 'Header 1', html_doc.at_css('h1').text.strip
    assert_equal 'simple - db_sequence', html_doc.at_css('title').text.strip
  end

  test 'render known - with non-param query' do
    get '/api/project/db_sequence/page/fcbedce2-870e-4372-b456-4a62afc23ba8/render'

    assert_response :success
    assert_equal "text/plain", @response.content_type

    # Ensure that the basic document structure is correct    
    html_doc = Nokogiri::HTML(@response.body)
    assert_equal '1', html_doc.at_css('p').text.strip
  end
end
