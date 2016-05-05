# The most general esqulino error
class EsqulinoError < StandardError
  attr_reader :code
  
  def initialize(msg="Internal Esqulino Error", code=500)
    @code = code
    super msg
  end

  def to_json(options)
    { :message => self.to_s }.merge(json_data).to_json(options)
  end

  def json_data()
    {  }
  end
end

# Thrown when a project is unknown
class UnknownProjectError < EsqulinoError
  def initialize(project_id)
    super "Unknown project \"#{project_id}\"", 404
  end
end

# Thrown when a query inside a project is unknown
class UnknownQueryError < EsqulinoError
  def initialize(project_id, query_id)
    super "Unknown query \"#{query_id}\" in project \"#{project_id}\"", 404
  end
end

# Thrown when a request does not fulfill a certain schema
class InvalidSchemaError < EsqulinoError
  attr_reader :schema_name, :errors

  def initialize(schema_name, errors)
    @schema_name = schema_name
    @errors = errors
    super "Request does not match the schema \"#{schema_name}\"", 400
  end

  def json_data()
    {
      :errors => @errors
    }
  end
end
