module Seed
  class BlockLanguageGeneratorSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = BlockLanguageGenerator
    SEED_DIRECTORY = "block_language_generators"

    # seed is overridden as BlockLanguageGenerator does not have any slug
    def seed
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : seed_name.find_by(id: seed_id)
    end
  end
end
