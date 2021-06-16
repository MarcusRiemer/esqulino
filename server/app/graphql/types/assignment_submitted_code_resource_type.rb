module Types
    class Types::AssignmentSubmittedCodeResourceType < Types::Base::BaseObject
        field :assignment_submission, Types::AssignmentSubmissionType, null: false
        field :code_resource, Types::CodeResourceType, null: false
        field :assignment_required_code_resource, Types::AssignmentRequiredCodeResourceType, null: false
    end
end