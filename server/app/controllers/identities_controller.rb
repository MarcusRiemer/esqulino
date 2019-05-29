

class IdentitiesController < ApplicationController
  before_action :authenticate_user!
  def show
    if signed_in?
      # TODO return every provider for a specific user
    end
  end
end

