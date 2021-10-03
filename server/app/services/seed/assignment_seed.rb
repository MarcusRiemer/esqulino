module Seed
    class AssignmentSeed < Base
      # configuration
      # SEED_IDENTIFIER is the class to stored or loaded
      # SEED_DIRECTORY is directory where the data will be stored or loaded
      SEED_IDENTIFIER = Assignment
      SEED_DIRECTORY = "assignments"
      
      def initialize(seed_id)
        super(
          seed_id,
          dependencies: {
            "assignment_required_code_resources" => Seed::AssignmentRequiredCodeResourceSeed,
          },
          defer_referential_checks: true
        )
      end

    end
  end
  