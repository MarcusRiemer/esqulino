class RenderProjectsController < ApplicationController
  def index
    puts request
    render plain: "Test"
  end
end
