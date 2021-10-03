module Seed
    class AssignmentTemplateCodeResourceSeed < Base
      # configuration
      # SEED_IDENTIFIER is the class to stored or loaded
      # SEED_DIRECTORY is directory where the data will be stored or loaded
      SEED_IDENTIFIER = AssignmentTemplateCodeResource
      SEED_DIRECTORY = "assignment_template_code_resources"

      def initialize(seed_id)
        super(
          seed_id,
          dependencies: {
            "code_resource" => Seed::CodeResourceSeed,
          },
          defer_referential_checks: true
        )
      end
    end
  end
  