# frozen_string_literal: true

# Handles low level operations on CodeResource, basicly the whole
# CRUD cycle. More specialised operations for specific types of
# resouces (pages, queries, ...) can be found in the respective
# controllers.
class CodeResourcesController < ApplicationController
  include JsonSchemaHelper

  # All available code resources for a certain programming language
  def index_by_programming_language
    render json: CodeResource
      .list_by_programming_language(params[:programming_language_id])
  end

  # Clones a specific resource
  def clone
    original = CodeResource.find(params[:code_resource_id])

    cloned = original.dup
    cloned.save!

    render json: cloned.to_full_api_response, status: 200
  end

  def destroy
    CodeResource.destroy(params[:code_resource_id])
    render status: 204
  rescue ActiveRecord::InvalidForeignKey
    c = CodeResource.find(params[:code_resource_id])
    raise EsqulinoError::CodeResourceReferenced, c
  end
end
