# Manages operations on generators for block languages
class BlockLanguageGeneratorsController < ApplicationController
  # List all existing block language generators
  def index
    render :json => BlockLanguageGenerator.all.map{|b| b.to_list_api_response}
  end

  # Find a single block language generator
  def show
    res = BlockLanguageGenerator.find(id_params[:id])
    render json: res.to_full_api_response
  end

  # These parameters may be used to identify a block language generator
  def id_params
    params.
      permit(:id)
  end
end
