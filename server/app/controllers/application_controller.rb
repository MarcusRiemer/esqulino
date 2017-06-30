require_dependency 'error'

class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  # Handle all application specific errors
  rescue_from EsqulinoError, :with => :show_errors

  protected

  # Simply react to errors by presenting them in a JSON representation
  def show_errors(exception)
    render status: exception.code, json: exception.to_liquid
  end
end
