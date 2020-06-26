# Manages operations on block languages
class BlockLanguagesController < ApplicationController
  include PaginationHelper
  # List all existing block languages and embed additional information
  # that is relevant when listing
  def index
    render :json => pagination_response(BlockLanguage,BlockLanguage.scope_list,options:{include_list_calculations:true})
  end

  # Find a single block language by ID or by slug
  def show
    needle = id_params[:id]
    block_lang = if (BlattwerkzeugUtil::string_is_uuid? needle) then
                   BlockLanguage.find needle
                 else
                   BlockLanguage.find_by! slug: needle
                 end

    render json: block_lang.to_full_api_response
  end

  # Create a new block language
  def create
    byebug
    block_lang = BlockLanguage.new(basic_params)
    block_lang.model = model_params

    if block_lang.save
      render :json => block_lang.to_full_api_response
    else
      render :json => { 'errors' => block_lang.errors }, status: 400
    end
  end

  # Updates an existing block language
  def update
    block_lang = BlockLanguage.find(id_params[:id])
    block_lang.assign_attributes basic_params
    block_lang.model = model_params

    if block_lang.save
      render status: 204
    else
      render json: { 'errors' => block_lang.errors }, :status => 400
    end
  end

  # Deletes an existing block language. If the language still has references,
  # the deletion process fails.
  def destroy
    block_lang = BlockLanguage.find(id_params[:id])
    begin
      block_lang.destroy!
      render status: 204
    rescue ActiveRecord::InvalidForeignKey
      render json: { 'errors' => ['EXISTING_REFERENCES'] }, :status => 400
    end
  end

  private

  # These parameters may be used to identify a block language
  def id_params
    params.
      permit(:id, :slug)
  end

  # These parameters are "normal" table attributes
  def basic_params
    params
      .permit([:name, :slug, :defaultProgrammingLanguageId, :family, :grammarId])
      .transform_keys { |k| k.underscore }
  end

  # These parameters need to be put in the json-blob
  def model_params
    # Allowing an array of arbitrary objects seems to be unsupported
    # by the strong parameters API :(
    params
      .to_unsafe_hash.slice(
        :rootCssClasses,
        :sidebars,
        :editorBlocks,
        :editorComponents,
        :localGeneratorInstructions
      )
  end

end
