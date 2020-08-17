class Mutations::News::CreateNews < Mutations::News::News

  argument :title, Types::Scalar::LangJson, required:true
  argument :text, Types::Scalar::LangJson, required:true
  argument :publishedFrom, GraphQL::Types::ISO8601DateTime, required:true

  def resolve(**args)
    news = News.new(
        title:args[:title],
        text:args[:text],
        published_from:args[:publishedFrom],
        user_id:context[:user].id)
    save_news(news)
  end
end


