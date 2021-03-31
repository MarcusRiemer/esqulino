# Manages operations on block languages
class BlockLanguagesController < ApplicationController
  # Find a single block language by ID or by slug
  def show
    needle = id_params[:id]
    block_lang = if BlattwerkzeugUtil::string_is_uuid? needle then
                   BlockLanguage.find needle
                 else
                   BlockLanguage.find_by! slug: needle
                 end
    render json: block_lang.to_full_api_response
  end

  private

  # These parameters may be used to identify a block language
  def id_params
    params
      .permit(:id, :slug)
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
