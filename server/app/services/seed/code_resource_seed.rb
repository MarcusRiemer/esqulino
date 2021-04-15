module Seed
  class CodeResourceSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = CodeResource
    SEED_DIRECTORY = "code_resources"

    def initialize(seed_id)
      super(seed_id, dependencies = {
              "generated_block_languages" => Seed::BlockLanguageSeed,
              "generated_grammars" => Seed::GrammarSeed,
      })
    end
  end
end
