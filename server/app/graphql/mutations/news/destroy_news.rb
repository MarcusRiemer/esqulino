class Mutations::News::DestroyNews < Mutations::News::News
  argument :id, ID, required: false

  def resolve(id:)
    news = News.find(id)
    destroy_news(news)
  rescue ActiveRecord::RecordNotFound
    {
      news: nil,
      errors: ["Couldn't find News with 'id'=\"#{id}\""]
    }
  end
end
