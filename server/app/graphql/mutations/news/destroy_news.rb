
class Mutations::News::DestroyNews < Mutations::News::News

  argument :id, ID, required:false

  def resolve(**args)
    news = News.find(args[:id])
    news.destroy
    {
        news: nil,
        errors: []
    }
  end
end


