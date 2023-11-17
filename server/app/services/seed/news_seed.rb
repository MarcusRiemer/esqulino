# frozen_string_literal: true

module Seed
  class NewsSeed < Base
    # configuration
    # SEED_IDENTIFIER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = News
    SEED_DIRECTORY = 'news'
  end
end
