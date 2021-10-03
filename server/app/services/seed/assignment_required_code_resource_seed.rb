module Seed
    class AssignmentRequiredCodeResourceSeed < Base
      # configuration
      # SEED_IDENTIFIER is the class to stored or loaded
      # SEED_DIRECTORY is directory where the data will be stored or loaded
      SEED_IDENTIFIER = AssignmentRequiredCodeResource
      SEED_DIRECTORY = "assignment_required_code_resources"

      def initialize(seed_id)
        super(
          seed_id,
          dependencies: {
            "template" => Seed::AssignmentTemplateCodeResourceSeed,
            "solution" => Seed::CodeResourceSeed,
          },
          defer_referential_checks: true
        )
      end
    end
  end
  