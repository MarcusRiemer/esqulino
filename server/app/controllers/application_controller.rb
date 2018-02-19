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
      @exception = exception
      @admin_mail = Rails.configuration.sqlino["mail"]["admin"]

      render template: "static_files/message_error", layout: "application_error"
    else
      # Simply react to internal errors by presenting them in a JSON representation
      render status: exception.code, json: exception.to_liquid
    end
  end
end
