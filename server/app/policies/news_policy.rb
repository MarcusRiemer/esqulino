class NewsPolicy < ApplicationPolicy
  attr_reader :user, :news

  def initialize(user, news)
    @user = user
    @news = news
  end

  def update?
    user.owner_of?(news) || user.is_admin? || user.has_role?(:news_editor, news)
  end

  def create?
    user.is_admin?
  end

  def destroy?
    user.is_admin? || user.owner_of?(news)
  end

  class Scope < Scope
    def resolve_show(id, lang: )
      if user.has_role?(:admin)
        News.all
            .find_by(id: id)
            .to_full_api_response
      else
        News.scope_single_language(lang)
            .where("id = ?", id)
            .first!
            .to_frontpage_api_response(languages: [lang])
      end
    end

    def resolve_index(lang: )
      if user.has_role?(:admin)
        News.all.map{|l| l.to_full_api_response}
      else
        News.scope_single_language(lang)
            .map { |l| l.to_frontpage_api_response(text_length: :short, languages: [lang]) }
      end
    end
  end
end