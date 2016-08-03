# The most general esqulino error, this base-class is required
# to distinguish "ordinary" ruby errors from those that are
# specific to esqulino.
class EsqulinoError < StandardError
  attr_reader :code

  # esqulino errors always provide a human readable error message
  # and a status code following the HTTP status code conventions
  #
  # @param msg [string] The user-facing error message
  # @param code [integer] The HTTP status code
  def initialize(msg="Internal Esqulino Error", code=500)
    @code = code
    super msg
  end

  # Used by Sinatra to serialize this error in a meaningful
  # representation for clients.
  def to_json(options)
    { :message => self.to_s }.merge(json_data).to_json(options)
  end

  # Can be used by specialised classes to provide additional
  # error context.
  #
  # @return [Hash] Additional error information
  def json_data()
    {  }
  end
end

# Some authentication went wrong
class AuthorizationError < EsqulinoError
  def initialize(msg = "Unauthorized", code = 401)
    super msg, code
  end
end

# Thrown when a project is unknown
class UnknownProjectError < EsqulinoError
  # @param project_id [string] The id of the unknown project
  def initialize(project_id)
    super "Unknown project \"#{project_id}\"", 404
  end
end

# Thrown when a query inside a project is unknown
class UnknownQueryError < EsqulinoError
  # @param project_id [string] The id of the unknown project
  # @param query_id [string] The id of the unknown query
  def initialize(project_id, query_id, part = "model")
    super "Unknown query (#{part}) \"#{query_id}\" in project \"#{project_id}\"", 404
  end
end

# Thrown when a page inside a project is unknown
class UnknownPageError < EsqulinoError
  # @param project_id [string] The id of the unknown project
  # @param page_ref [string] The id or name of the unknown page
  def initialize(project_id, page_ref, part = "model")
    super "Unknown page (#{part}) \"#{page_ref}\" in project \"#{project_id}\"", 404
  end
end

# Thrown when a reference is unknown
class UnknownReferenceNameError < EsqulinoError
  def initialize(project, page, name)
    super "Could not find \"#{name}\" on page \"#{page.name}\" in project \"#{project.id}\""
  end
end

# Something went wrong while executing a query
class DatabaseQueryError < EsqulinoError
  def initialize(project, sql, params, exception)
    super(exception.to_s, 400)
    @project = project
    @sql = sql
    @params = params
  end

  def json_data
    {
      :project => @project.id,
      :sql => @sql,
      :params => @params
    }
  end
end

# Thrown when a request does not fulfill a certain schema
class InvalidSchemaError < EsqulinoError
  attr_reader :schema_name, :errors

  # @param schema_name [string] The name of the schema that caused the
  #                             validation to fail
  # @param errors [Array<String>] The validation errors
  def initialize(schema_name, errors)
    @schema_name = schema_name
    @errors = errors
    super "Request does not match the schema \"#{schema_name}\"", 400
  end

  # @return [Hash] The errors as reported by the JSON-schema-validator
  def json_data()
    {
      :errors => @errors
    }
  end
end
