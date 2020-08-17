class Mutations::News::UpdateNews < Mutations::News::News

  argument :id, ID, required:true
  argument :title, Types::Scalar::LangJson, required:true
  argument :text, Types::Scalar::LangJson, required:true
  argument :publishedFrom, GraphQL::Types::ISO8601DateTime, required:true
  argument :userId, ID, required:false

  def resolve(**args)
    begin
    args = underscore_keys(args)
    news = News.find(args[:id])
    args[:user_id] = context[:user].id
    news.assign_attributes(args)
    save_news(news)
    rescue ActiveRecord::RecordNotFound
      {
          news: nil,
          errors: ["Couldn't find News with 'id'=#{args[:id]}"]
      }
    end
  end
end

