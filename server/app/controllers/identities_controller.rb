

class IdentitiesController < ApplicationController
  def new
    @identity = env['omniauth.identity']
  end

  def create
    identitiy = Identity.create(email: params[:email], password: params[:password])
    identitiy.save!
  end
end

