class BlockLanguagePolicy < ApplicationPolicy
  attr_reader :user, :block_language

  def initialize(user, block_language)
    @user = user
    @block_language = block_language
  end

  # May the user persist the current state of the project to the seed data?
  # If this is permitted, the stored data may end up in git.
  def store_seed?
    user.has_role?(:admin)
  end
end
