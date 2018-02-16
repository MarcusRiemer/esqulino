require_dependency 'error'

class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  # Handle all errors that are specifc to our parts of the code
  rescue_from EsqulinoError, :with => :handle_exception

  protected

  def handle_exception(exception)
    # Handle errors that might be seen by users with a slightly nicer
    # representation than pure JSON.
    if exception.is_a? EsqulinoMessageError then
      heading = "# Error"
      message = exception.user_message
      diagnostic_header = "The following information might be helpful to fix the error: "
      data = exception.to_liquid.to_json
      
      render status: exception.code, plain: [heading, message, diagnostic_header, data].join("\n")
    else
      # Simply react to internal errors by presenting them in a JSON representation
      render status: exception.code, json: exception.to_liquid
    end
  end
end
