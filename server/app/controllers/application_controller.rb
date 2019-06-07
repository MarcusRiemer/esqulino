require_dependency 'error'

class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  include LocaleHelper

  # Handle all errors that are specifc to our parts of the code
  rescue_from EsqulinoError, :with => :handle_internal_exception

  # Hand out 404 errors as fallbacks if Active Record doesn't find something
  rescue_from ActiveRecord::RecordNotFound, :with => :handle_record_not_found
  protected

  # AUTHENTICATION METHODS

  def signed_in?
    return !@current_user.nil?
  end

  def set_identity(identity)
    @identity = identity
  end

  def create_identity(auth = request.env["omniauth.auth"], email = false)
    @identity = Identity.search(auth)
    if !@identity
      if (email) 
        IdentityMailer.confirm_email(auth, request_locale).deliver
      end
      @identity = Identity.create_with_auth(auth, current_user)
    end
  end

  def sign_in
    if !signed_in?
      @current_user = @identity.user
      token = Auth.encode({user_id: @identity.user_id, data: @identity[:data]})
      response_jwt_cookie(token)
    end
  end

  def sign_out!
    if signed_in?
      @current_user = nil
      delete_jwt_cookie!
    end
  end

  def response_jwt_cookie(value, expires = 1.day.from_now)
    response.set_cookie('JWT-TOKEN', {
      value: value,
      httponly: true,
      expires: expires,
      path: '/'
    })
  end

  def delete_jwt_cookie!()
    response_jwt_cookie("", 0.seconds.from_now)
  end

  def authenticate_user!
    current_user()
  end

  def current_user
    token = request.cookies['JWT-TOKEN']
    if token
      begin
        token_decoded =  Auth.decode(token)
        if !token_decoded[:data] || token_decoded[:data][:confirmed]
          @current_user = User.find(token_decoded[:user_id].to_s)
        else
          # TODO ERROR MSG: Please confirm your e-mail adress
        end
      rescue ActiveRecord::RecordNotFound => e
        sign_out!
        render json: { errors: e.message }, status: :unauthorized
      rescue JWT::DecodeError => e
        sign_out!
        render json: { errors: e.message }, status: :unauthorized
      end
    else
      sign_out!
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
