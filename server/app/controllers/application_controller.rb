require_dependency 'error'
require 'bcrypt'

class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  # Handle all errors that are specifc to our parts of the code
  rescue_from EsqulinoError, :with => :handle_internal_exception

  # Hand out 404 errors as fallbacks if Active Record doesn't find something
  rescue_from ActiveRecord::RecordNotFound, :with => :handle_record_not_found
  protected

  # AUTHENTICATION METHODS

  def api_response(hash)
    render json: hash
      .transform_keys { |k| k.to_s.camelize(:lower) }, status: :ok
  end

  def signed_in?
    return !@current_user.nil?
  end

  def authenticate_user!
    token = request.cookies['JWT-TOKEN']
    if token
      begin
        token_decoded = Auth.decode(token)
        if token_decoded[:data]["confirmed"]
          @current_user = User.find(token_decoded[:user_id].to_s)
        end
      rescue ActiveRecord::RecordNotFound => e
        render json: { errors: e.message }, status: :unauthorized
      rescue JWT::DecodeError => e
        render json: { errors: e.message }, status: :unauthorized
      end
    else
      @current_user = nil
    end
  end

  # An instance of EsqulinoError was thrown
  def handle_internal_exception(exception)
    Raven.capture_exception(exception)

    # Handle errors that might be seen by users with a slightly nicer
    # representation than pure JSON.
    if exception.is_a? EsqulinoMessageError then
      @exception = exception
      @admin_mail = Rails.configuration.sqlino["mail"]["admin"]

      render status: @exception.code,
             template: "static_files/message_error",
             layout: "application_error",
             formats: [:html]
    else
      # Simply react to internal errors by presenting them in a JSON representation
      render status: exception.code, json: exception.to_liquid
    end
  end

  # Active record couldn't find a specific record
  def handle_record_not_found
    render status: 404, plain: ""
  end

end
