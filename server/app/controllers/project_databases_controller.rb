require 'open3'

require_dependency 'schema-graphviz'

class ProjectDatabasesController < ApplicationController
  include ProjectsHelper
  
  def visual_schema
    project_id = params['project_id']
    database_id = params['database_id']
    
    # Build the GraphViz description of the database
    db_path = current_project.file_path_sqlite_from_id(database_id)
    db_graphviz = database_graphviz_schema(db_path)

    # The default renderer currently is svg:cairo, but
    # the user may override it.
    format = params.fetch('format', 'svg')


    # Per default there is no download, so there is no need
    # for any complex disposition data
    data_disposition = 'inline'
    data_filename = nil
    
    # Does the user want to download the file?
    if params.has_key? 'download'
      file_extension = format.split(':').first
      data_filename = "#{project_id}-db-schema-#{database_id}.#{file_extension}"
      data_disposition = 'attachment'
    end

    # Did the user request the internal graphviz format?
    # This is probably only useful to debug stuff, but there
    # seems no harm in handing out the sources.
    if format == 'graphviz'
      send_data db_graphviz, type: 'text'
    else
      # Invoke graphviz to actually render something
      db_img, err, status = Open3.capture3('dot',"-T#{format}", :stdin_data => db_graphviz)

      # Was the rendering successful?
      if status.exitstatus != 0
        halt 500, {'Content-Type' => 'text/plain'}, err
      else
        # We need some special work for SVG images
        content_type = if format.start_with? 'svg'
          # Set matching MIME-type and replace relative paths
          db_img.gsub! 'vendor/icons/', '/vendor/icons/'
          "image/svg+xml"
        else
          # Other images only require a matching MIME-type
          "image/#{format}"
        end
        
        send_data db_img, type: content_type, disposition: data_disposition, filename: data_filename
      end
    end

  end
end
