# frozen_string_literal: true

# Various files for that no processing is required
class StaticFilesController < ApplicationController
  # Required to make use of rails templates
  include ActionView::Rendering

  # Allows access to schema files
  include JsonSchemaHelper

  # Used to determine the language of a request
  include LocaleHelper

  # Serves known static files or falls back to the index.html if the
  # file that is asked for is not known
  def index
    requested_path = URI.parse(request.original_url).path[1..]
    if requested_path.start_with? 'api'
      # API paths are never static pages
      render plain: 'API endpoint triggered by fallback controller', status: 503
    else
      # Try to use the request locale first, but try others just in case
      possible_locales = [request_locale, 'de', 'en', nil]
      local_path = locale_index_path(possible_locales.shift, requested_path)

      local_path = locale_index_path(possible_locales.shift, requested_path) while !possible_locales.empty? && local_path.nil? || !File.exist?(local_path)

      # Still no file found? Thats an error
      raise EsqulinoError::NoCompiledClient, local_path if local_path.nil? || !File.exist?(local_path)

      send_file local_path, disposition: 'inline'
    end
  end

  # Serves JSON schema files from the path this is specified in the configuration
  def schema
    schema_name = params[:schema_name]
    schema_file = schema_path(schema_name)
    if File.exist? schema_file
      send_file schema_file, disposition: 'inline'
    else
      render status: 404, plain: ''
    end
  end

  private

  def locale_index_path(request_locale, requested_path)
    # Assume that the URL immediatly denotes a file we know
    basepath = Rails.configuration.sqlino[:client_dir]

    local_path = if request_locale.nil?
                   basepath.join(requested_path)
                 else
                   basepath.join(request_locale, requested_path)
                 end

    # If we don't know that file, assume that the index file
    # was requested
    if requested_path.empty? || !File.exist?(local_path)
      local_path = if request_locale.nil?
                     basepath.join('index.html')
                   else
                     basepath.join(request_locale, 'index.html')
                   end
    end

    local_path
  end
end
