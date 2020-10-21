module Seed
  require_dependency "seed/grammar_seed"

  class BlockLanguageSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = BlockLanguage
    SEED_DIRECTORY = "block_languages"

    def initialize(seed_id)
      super(seed_id, dependencies = {
        "grammar" => GrammarSeed
      })
    end
  end
end
