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
                      .find_by(id: params[:id])
                      .to_full_api_response
  end

  def update
    news = News.all.find_by(id: params[:id])
    begin
      transformed_data = parse_publish_from(params_updated_news)
      news.update(transformed_data)

      render :json => news.to_full_api_response
    rescue ArgumentError => e
      render status: 400, :json => news.to_full_api_response
    end
  end

  def create_news
    begin
      transformed_data = parse_publish_from(params_updated_news)
      news = News.create(transformed_data)

      render :json => news.to_full_api_response
    rescue ArgumentError => e
      render status: 400
    end
  end

  def delete_news
    news = News.all.find_by(id: params[:id])
    if (news)
      news.destroy
    else
      render status: 400
    end
  end

  def params_updated_news
    params.permit(:publishedFrom, title: LocaleHelper.allowed_languages, text: [:de, :en])
      .transform_keys { |k| k.underscore }
  end

  def parse_date(date_str)
    Date.parse(date_str)
  rescue ArgumentError => e
    raise ArgumentError.new("Error: #{e} invalid date")
  end

  def parse_publish_from(data)
    if (data.key?(:published_from))
      data[:published_from] = parse_date(data[:published_from])
    else
      data[:published_from] = nil
    end
    return data
  end
end