class NewsController < ApplicationController
  include LocaleHelper
  
  def index
    locale = request_locale
    render :json => News.scope_single_language(locale).map{|l| l.to_list_api_response}  
  end

  def show
    locale = request_locale
    render :json => News.scope_single_language(locale)
                      .where("id = ?", params[:id])
                      .first
                      .to_list_api_response
  end

  def index_admin
    render :json => News.all.map{|l| l.to_full_api_response}
  end

  def show_admin
    render :json => News.all
  end
end