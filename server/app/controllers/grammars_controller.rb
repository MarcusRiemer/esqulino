# Manages operations on grammars
class GrammarsController < ApplicationController
  include UserHelper
  include PaginationHelper
  include JsonSchemaHelper

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
    params
      .permit(:id, :slug)
  end
end
