class GraphqlController < ApplicationController
  include UserHelper
  include LocaleHelper
  include GraphqlQueryHelper

  # Runs a GraphQL query for a "normal" user. This doesn't actually trust the
  # query that the client is sending but instead loads the query from a secure
  # location on the server.
  def execute
    variables = ensure_hash(params[:variables])
    operation_name = params[:operationName]

    raise EsqulinoError::Base, 'GraphQL queries must provide operationName' unless operation_name

    # Load the query from the server instead of trusting the client
    query = get_query(operation_name)

    # TODO: proper authorisation instead of relying on the name of the query
    raise EsqulinoError::Authorization if operation_name and operation_name.start_with? 'Admin' and !current_user.is_admin?

    context = {
      user: current_user,
      language: request_locale
    }

    result = ServerSchema.execute(query, variables:, context:, operation_name:)
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?

    handle_error_in_development e
  end

  # Runs a GraphQL query for a developer. This trusts the query that is sent by the
  # client and should never be used in production.
  def execute_graphiql
    raise EsqulinoError::Base, 'Client queries are only executed in development' unless Rails.env.development?

    variables = ensure_hash(params[:variables])
    operation_name = params[:operationName]
    query = params[:query]

    context = {
      user: current_user,
      language: request_locale
    }

    result = ServerSchema.execute(query, variables:, context:, operation_name:)
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?

    handle_error_in_development e
  end

  private

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
end
