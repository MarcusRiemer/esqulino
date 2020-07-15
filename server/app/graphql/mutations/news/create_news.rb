class Mutations::News::CreateNews < Mutations::News::News

  argument :title, GraphQL::Types::JSON, required:true
  argument :text, GraphQL::Types::JSON, required:true
  argument :publishedFrom, GraphQL::Types::ISO8601DateTime, required:true
  argument :userId, ID, required:false

  def resolve(**args)
    news = News.new(
        title:args[:title],
        text:args[:text],
        published_from:args[:publishedFrom],
        user_id:context[:current_user].id)
    if news.save
      {
          id: news.id,
          errors: []
      }
    else
      {
          id: nil,
          errors: news.errors.full_messages
      }
    end
  end
end


