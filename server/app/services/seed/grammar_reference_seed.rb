class Seed::GrammarReferenceSeed < Seed::Base
  SEED_IDENTIFIER = GrammarReference
  SEED_DIRECTORY = "grammar_references"

  def initialize(seed_id)
    super(
      seed_id,
      dependencies: {
        "origin" => Seed::GrammarSeed,
        "target" => Seed::GrammarSeed,
      },
      defer_referential_checks: true
    )
  end
end