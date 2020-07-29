
# Provides access to a globally available Validator instance
module GraphqlQueryHelper
  include UserHelper
  include LocaleHelper

  @@query_storage = GraphqlQueryStorage.new Rails.configuration.sqlino['query_dir']

  def execute(name:, variables:, user:nil)
    variables = ensure_hash(variables)
    query = @@query_storage.get_query(name.underscore)
    context = {
        user: user ? user : current_user(false),
        language: request_locale
    }
    ServerSchema.execute(query, variables: variables, context: context, operation_name: name)
  rescue => e
    raise e unless Rails.env.development?
    handle_error_in_development e
  end

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

  def handle_error_in_development(e)
    logger.error e.message
    logger.error e.backtrace.join("\n")

    render json: { error: { message: e.message, backtrace: e.backtrace }, data: {} }, status: 500
  end

  def get_query(name)
    @@query_storage.get_query(name.underscore)
  end

  # Returns the path the given query would be found under
  def schema_path(name)
    @@query_storage.query_path(name)
  end
end
