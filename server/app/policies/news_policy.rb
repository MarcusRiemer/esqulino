# frozen_string_literal: true

class NewsPolicy < ApplicationPolicy
  attr_reader :user, :news

  def initialize(user, news)
    @user = user
    @news = news
  end

  def update?
    user.owner_of?(news) || user.is_admin? || user.has_role?(:news_editor)
  end

  def create?
    user.is_admin? || user.has_role?(:news_editor)
  end

  def destroy?
    user.is_admin? || user.owner_of?(news)
  end
end
