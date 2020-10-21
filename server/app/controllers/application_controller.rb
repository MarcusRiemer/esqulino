# Base controller with common functionality that may be required
# in every controller.
class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods
  include Pundit
  include JwtHelper # This pulls very many things only to handle the unexpected logout ...

  # Hand out 404 errors as fallbacks if Active Record doesn't find something
  rescue_from ActiveRecord::RecordNotFound, :with => :handle_record_not_found

  # Hand out 403 errors if something is forbidden
  rescue_from Pundit::NotAuthorizedError, :with => :handle_authorization_exception

  # Fall handling of all errors that are specifc to our parts of the code
  rescue_from EsqulinoError::Base, :with => :handle_internal_exception

  protected

  # By convention Typescript uses camelCase and Ruby uses snake_case.
  # Working against this can be very tiresome, but luckily there are
  # conversion methods in place.
  #
  # @param response [Hash] Any kind of hash which will have its keys
  #   on the first level transformed from snake_case to camelCase.
  def api_response(response)
    render json: response
      .transform_keys { |k| k.to_s.camelize(:lower) }, status: :ok
  end

  def error_response(err = "something went wrong", code = 401)
    raise EsqulinoError::Base.new(err, code)
  end

  # Active record couldn't find a specific record.
  def handle_record_not_found(exception)
    render status: 404, plain: exception.message
  end

  def handle_authorization_exception(exception)
    render status: 403
  end

  # Handling all exceptions that are BlattWerkzeug-specific.
  def handle_internal_exception(exception)
    Raven.capture_exception(exception)

    # Controllers may signal some kind of authentication problem by throwing
    # an exception. If unhandled this must log out the user.
    if exception.is_a? EsqulinoError::UnexpectedLogout
      clear_secure_cookies
    end

    # Handle errors that might be seen by users with a slightly nicer
    # representation than pure JSON.
    if exception.is_a? EsqulinoError::Message then
      @exception = exception
      @admin_mail = Rails.configuration.sqlino[:mail][:admin]

      render status: @exception.code,
             template: "static_files/message_error",
             layout: "application_error",
             formats: [:html]
    else
      # Simply react to internal errors by presenting them in a JSON representation
      render status: exception.code, json: exception.to_liquid
    end
  end
end
