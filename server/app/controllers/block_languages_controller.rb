class BlockLanguagesController < ApplicationController
  # List all existing block languages
  def index
    render json: BlockLanguage.all.map{|b| b.to_list_api_response}
  end
end
