class NewsPolicy < ApplicationPolicy
  attr_reader :user, :news

  def initialize(user, news)
    @user = user
    @news = news
  end

  def update?
    user.owner_of?(news) || user.has_role?(:admin) || user.has_strict_role?(:news_editor, news)
  end

  def create?
    user.has_role? :admin
  end
#
  def delete?
    user.has_role? :admin || user.owner_of?(news)
  end
end