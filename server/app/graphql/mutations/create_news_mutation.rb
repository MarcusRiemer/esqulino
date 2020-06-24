class Mutations::CreateNewsMutation < Mutations::BaseMutation
  argument :title, GraphQL::Types::JSON, required:true
  argument :text, GraphQL::Types::JSON, required:true
  argument :publishedFrom, Types::Scalar::Datetime, required:false

  field :news, Types::NewsType, null:true
  field :errors, [String], null: false

  def resolve(title:,text:,publishedFrom:nil)

      news = News.new(
          title:title,
          text:text,
          published_from:publishedFrom,
          user_id:context[:current_user].id)
      if news.save
        {
            news: news,
            errors: []
        }
      else
        {
            news: nil,
            errors: news.errors.full_messages
        }
      end
  end
end



