class NewsController < ApplicationController
  include LocaleHelper
  include JsonSchemaHelper
  include UserHelper

  # All news that are visible on the frontpage
  def index
    render :json => News.scope_single_language(request_locale)
                      .map { |l| l.to_frontpage_api_response(text_length: :short, languages: [request_locale]) }
  end

  # A single news that is visible on the frontpage
  def show
    render :json => News.scope_single_language(request_locale)
                      .where("id = ?", params[:id])
                      .first!
                      .to_frontpage_api_response(languages: [request_locale])
  end

  # All news that are visible in the admin backend
  def index_admin
    render :json => News.all.map{|l| l.to_full_api_response}
  end

  # A single news that is visible in the admin backend
  def show_admin
    render :json => News.all
                      .find_by(id: params[:id])
                      .to_full_api_response
  end

  # A single news is updated via the admin backend
  def update
    news = News.find(params[:id])
    request_data = ensure_request("NewsUpdateDescription", request.body.read)
    begin
      authorize news
      # TODO: This is a general pattern, it could be moved to the application controller
      news.assign_attributes(request_data)
      if news.save
        render :json => news.to_full_api_response
      else
        render json: { 'errors' => news.errors.as_json }, :status => 400
      end
    rescue Pundit::NotAuthorizedError => e
      error_response("You need the permission")
    end
  end

  # Creation of single news
  def create
    request_data = ensure_request("NewsUpdateDescription", request.body.read)

    creation_hash = append_current_user(request_data)

    begin
      authorize News, :create?
      news = News.create(creation_hash)

      render :json => news.to_full_api_response
    rescue Pundit::NotAuthorizedError => e
      error_response("You need the permission")
    end
  end

  # Deletion of a single news
  def destroy
    news = News.all.find(params[:id])
    begin
      authorize news
      news.destroy
    rescue Pundit::NotAuthorizedError => e
      error_response("You need the permission")
    end
  end

  private

  # Ensures that the date of the request is a proper ruby object
  def ensure_request(schema_name, body_string)
    # Do the basic loading and checking
    data = super

    # Turn the date-string into a proper date object
    published_from = data["published_from"]
    if published_from
      data["published_from"] = parse_date(published_from)
    end

    return data
  end

  # Parses the given date, possibly throws an Error if the string
  # is not actually a valid date.
  def parse_date(date_str)
    Date.parse(date_str)
  rescue ArgumentError => e
    raise EsqulinoError::Base.new("Invalid date #{date_str}", 400)
  end

  # Appends current_user to a hash
  def append_current_user(hash)
    hash[:user] = current_user
    return hash
  end
end