class Mutations::News::UpdateNews < Mutations::News::News

  argument :id, ID, required:true
  argument :title, GraphQL::Types::JSON, required:true
  argument :text, GraphQL::Types::JSON, required:true
  argument :publishedFrom, GraphQL::Types::ISO8601DateTime, required:true
  argument :userId, ID, required:false

  def resolve(**args)
    byebug
    news = News.find(args["id"])
    request_data = ensure_request("NewsUpdateDescription", request.body.read)
    # TODO: This is a general pattern, it could be moved to the application controller
    news.assign_attributes(request_data)
    save_news(news)
  end
end

