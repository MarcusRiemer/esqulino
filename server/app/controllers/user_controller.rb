class UserController < ApplicationController
  before_action :authenticate_user!

  def index
    if signed_in?
      # TODO Data from JWT
      to_return = {
        name: "Tom",
        logged_in: true
      }
    else
      to_return = { logged_in: false }
    end
    render json: to_return
      .transform_keys { |k| k.to_s.camelize(:lower) }
  end
end
