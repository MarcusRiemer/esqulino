# Manages operations on grammars
class GrammarsController < ApplicationController
  # List all existing grammars
  def index
    render :json => Grammar.all.map{|g| g.to_list_api_response}
  end

  # Creates a new grammar
  def create
    grammar = Grammar.new(basic_params)
    grammar.model = model_params

    if grammar.save
      render :json => { 'id' => grammar.id }
    else
      render :json => { 'errors' => grammar.errors.as_json }, status: 400
    end
  end

  # Updates an existing grammar
  def update
    grammar = Grammar.find(id_params['id'])
    grammar.update basic_params
    grammar.model = model_params

    if grammar.save
      render status: 204
    else
      byebug
      render json: { 'errors' => grammar.errors.as_json }, :status => 400
    end
  end

  private

  # These parameters may be used to identify a grammar
  def id_params
    params.
      permit(:id, :slug)
  end

  
  # These parameters are "normal" table attributes
  def basic_params
    params
      .permit([:name, :slug])
      .transform_keys { |k| k.underscore }
  end

  # These parameters need to be put in the json-blob
  def model_params
    # Allowing an array of arbitrary objects seems to be unsupported
    # by the strong parameters API :(
    params
      .to_unsafe_hash.slice(:types, :root)
  end

end
