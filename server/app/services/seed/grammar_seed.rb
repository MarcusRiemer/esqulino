module Seed
  require_dependency "seed/programming_language_seed"

  class GrammarSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = Grammar
    SEED_DIRECTORY = "grammars"

    def initialize(seed_id)
      super(seed_id, dependencies = {
              "programming_language" => ProgrammingLanguageSeed
            }, defer_referential_checks = true)
    end
  end
end
