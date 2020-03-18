class GrammarPolicy < ApplicationPolicy
  attr_reader :user, :grammar

  def initialize(user, grammar)
    @user = user
    @grammar = grammar
  end

  def code_resources_gallery?
    user.has_role?(:admin)
  end
end