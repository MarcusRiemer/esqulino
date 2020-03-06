# Manages operations on grammars
class GrammarsController < ApplicationController
  include UserHelper

  # List all existing grammars
  def index
    render :json => index_pagination_response(Grammar.scope_list)
  end

  # Find a single grammar
  def show
    needle = id_params[:id]

    grammar = if (BlattwerkzeugUtil::string_is_uuid? needle) then
                Grammar.find(needle)
              else
                Grammar.find_by! slug: needle
              end

    render json: grammar.to_full_api_response
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
    grammar.assign_attributes basic_params
    grammar.model = model_params

    if grammar.save
      render status: 204
    else
      render json: { 'errors' => grammar.errors.as_json }, :status => 400
    end
  end

  # Deletes an existing grammar. If the grammar still has references,
  # the deletion process fails.
  def destroy
    grammar = Grammar.find(id_params['id'])
    begin
      grammar.destroy!
      render status: 204
    rescue ActiveRecord::InvalidForeignKey
      render json: { 'errors' => ['EXISTING_REFERENCES'] }, :status => 400
    end
  end

  # Finds block languages that are related to a grammar
  def related_block_languages
    render :json => BlockLanguage.scope_list
                      .where(grammar_id: id_params[:id])
                      .map{|b| b.to_list_api_response}
  end

  # List all code resources that depend on a single grammar
  def code_resources_gallery
    grammar = Grammar.find(id_params[:id])

    authorize grammar

    render json: grammar
             .code_resources
             .map { |c| c.to_full_api_response }
  end

  private

  # Pagination for any query that lists projects
  def index_pagination_response(query)
    order_key = grammar_list_params.fetch("order_field", "name")
    order_dir = grammar_list_params.fetch("order_direction", "asc")

    if (not Grammar.has_attribute? order_key or not ["asc", "desc"].include? order_dir)
      raise EsqulinoError::InvalidOrder.new(order_key, order_dir)
    end

    paginated_query = query
              .order({ order_key => order_dir})
              .limit(grammar_list_params.fetch("limit", 100))
              .offset(grammar_list_params.fetch("offset", 0))
    return {
      data: paginated_query.map{|p| p.to_list_api_response},
      meta: {
        totalCount: query.size
      }
    }
  end

  # These attributes
  def grammar_list_params
    params.permit(:limit, :offset, :orderField, :orderDirection)
      .transform_keys { |k| k.underscore }
  end

  # These parameters may be used to identify a grammar
  def id_params
    params.
      permit(:id, :slug)
  end


  # These parameters are "normal" table attributes
  def basic_params
    params
      .permit([:name, :technicalName, :slug, :programmingLanguageId])
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
