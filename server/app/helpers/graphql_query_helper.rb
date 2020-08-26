
# Provides access to a globally available Validator instance
module GraphqlQueryHelper
  include UserHelper
  include LocaleHelper

  @@query_storage = GraphqlQueryStorage.new Rails.configuration.sqlino['query_dir']

  # Handle form data, JSON body, or a blank value
  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      if ambiguous_param.present?
        ensure_hash(JSON.parse(ambiguous_param))
      else
        {}
      end
    when Hash, ActionController::Parameters
      ambiguous_param
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end

  def get_query(name)
    @@query_storage.get_query(name.underscore)
  end

  def exists?(name:)
    @@query_storage.exists?(query_name:name)
  end


  # Returns the path the given query would be found under
  def schema_path(name)
    @@query_storage.query_path(name)
  end
end
