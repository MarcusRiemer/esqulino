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

  # Create a new block language generator
  def create
    generator = BlockLanguageGenerator.new(basic_params)
    generator.model = model_params

    if generator.save
      render :json => { 'id' => generator.id }
    else
      render :json => { 'errors' => generator.errors }, status: 400
    end
  end

  # Updates an existing block language generator
  def update
    generator = BlockLanguageGenerator.find(id_params[:id])
    generator.assign_attributes basic_params
    generator.model = model_params

    if generator.save
      render status: 204
    else
      render json: { 'errors' => generator.errors }, :status => 400
    end
  end

  private

  # These parameters may be used to identify a block language generator
  def id_params
    params.
      permit(:id)
  end

  # These parameters are "normal" table attributes
  def basic_params
    params
      .permit([:name, :targetName])
      .transform_keys { |k| k.underscore }
  end

  # These parameters need to be put in the json-blob
  def model_params
    # Allowing an array of arbitrary objects seems to be unsupported
    # by the strong parameters API :(
    params
      .to_unsafe_hash.slice(:editorComponents)
  end
end
