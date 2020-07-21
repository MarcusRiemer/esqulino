# Manages operations on grammars
class GrammarsController < ApplicationController
  include UserHelper
  include PaginationHelper
  include JsonSchemaHelper

  # List all existing grammars
  def index
    render :json => pagination_response(Grammar,Grammar.scope_list)
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
    creation_attributes = ensure_request("GrammarRequestUpdateDescription", request.body.read)
    grammar = Grammar.new(creation_attributes)

    if grammar.save
      render :json => { 'id' => grammar.id }
    else
      render :json => { 'errors' => grammar.errors.as_json }, status: 400
    end
  end

  # Updates an existing grammar
  def update
    updated_attributes = ensure_request("GrammarRequestUpdateDescription", request.body.read)

    grammar = Grammar.find(id_params['id'])
    grammar.assign_attributes updated_attributes

    # Possibly update the code resource that this grammar is based on
    if params.key? "generatedFromId"
      grammar.generated_from_id = params.fetch("generatedFromId", nil)
    end

    # Possibly update the root node
    if params.key? "root"
      grammar.root = params.fetch("root", nil)
    end

    begin
      grammar.save!
      render status: 204
    rescue ActiveRecord::InvalidForeignKey, ActiveRecord::RecordInvalid
      render json: { 'errors' => grammar.errors.as_json }, :status => 400
    end
  end

  def regenerate_foreign_types
    grammar = Grammar.find(id_params['id'])

    grammar.refresh_from_references!
    grammar.save!

    render json: grammar.to_full_api_response
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
                      .map{|b| b.to_list_api_response(options:{include_list_calculations: false})}
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

  # These parameters may be used to identify a grammar
  def id_params
    params.
      permit(:id, :slug)
  end


  # All parameters that make up the model
  def model_params
    params
      .transform_keys { |k| k.underscore }
      .to_unsafe_hash
  end

end
