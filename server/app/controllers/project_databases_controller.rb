require 'open3'

require_dependency 'schema_graphviz'
require_dependency 'schema_alter'

class ProjectDatabasesController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper

  def current_project
    @current_project ||= Project.find_by(slug: params['project_id'])
  end

  def current_database
    database_id = nil # params['database_id']
    @current_database = current_project.database_by_id_or_default(database_id)
  end

  # Returns a visual representation of the schema, rendered with Graphviz
  def visual_schema
    # Build the GraphViz description of the database
    db_path = current_database.sqlite_file_path
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

  # Creates a new table in the given database
  def table_create
    ensure_write_access do
      table_description = ensure_request("TableDescription", request.body.read)

      # Grab the database and modify it
      if (current_database.nil?) then
        # TODO: Actually throw an error, databases should be added seperatly
        current_project.create_default_database(name: "default", project_id: current_project.id)
        current_project.save!
      end
      current_database.table_create table_description
      current_database.save!
    end
  end


  # Alters a certain table of a database
  def table_alter
    ensure_write_access do
      # Grab parameters
      table_name = params['tablename']
      alter_schema_request = JSON.parse request.body.read

      # Alter the database
      current_database.table_alter table_name, alter_schema_request['commands']

      # And tell the client about the new schema
      result_schema = database_describe_schema(sqlite_file_path)
      render :json => { :schema => result_schema }
    end
  end


  # Drops a single table of the given database.
  def table_delete
    ensure_write_access do
      # Grab the database and modify it
      current_database.table_delete params['tablename']
      current_database.save!
    end
  end

  # Retrieves the actual data for a number of rows in a certain table
  def table_row_data
    amount = params['amount'].to_i
    from = params['from'].to_i
    tablename = params['tablename']

    render :json => current_database.table_row_data(tablename, from, amount)
  end

  # Retrieves the actual data for a number of rows in a certain table
  def table_row_count
    render :json => current_database.table_row_count(params['tablename'])
  end
end
