class GraphqlController < ApplicationController
  include UserHelper
  include LocaleHelper
  include GraphqlQueryHelper

  # Runs a GraphQL query
  def execute
    variables = ensure_hash(params[:variables])
    operation_name = params[:operationName]

    if not operation_name
      raise EsqulinoError::Base.new "GraphQL queries must provide operationName"
    end

    # Load the query from the server instead of trusting the client
    query = get_query(operation_name)

    # TODO: proper authorisation instead of relying on the name of the query
    if operation_name and operation_name.start_with? "Admin" and not current_user.is_admin?
      raise EsqulinoError::Authorization
    end

    context = {
      user: current_user,
      language: request_locale
    }

    result = ServerSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
    render json: result
  rescue => e
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
