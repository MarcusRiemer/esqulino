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
                      .where("id = ?", params[:id])
                      .first
                      .to_full_api_response
  end

  def update
    news = News.all
                  .where('id = ?', params[:id])
                  .first

    transformed_data = transform_updated_news

    transformed_data[:published_from] = parse_date(transformed_data[:published_from], news[:published_from])


    news.update(transformed_data)

    render :json => news.to_full_api_response
  end

  def transform_updated_news
    params.permit(:publishedFrom, title: [:de, :en], text: [:de, :en])
      .transform_keys { |k| k.underscore }
  end

  def parse_date(date_str, current_date)
    Date.parse(date_str)
  rescue
    current_date
  end
  
end