module Seed
  class BlockLanguageGeneratorSeed < Base
    SEED_IDENTIFIER = BlockLanguageGenerator
    SEED_DIRECTORY = "block_language_generators"

    def seed
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : find_by(id: seed_id)
    end
  end
end
