module Types
    class Types::AssignmentSubmittedCodeResourceType < Types::Base::BaseObject
        field :assignment_submission, Types::AssignmentSubmissionType, null: false
        field :assignment_submission_id, ID, null: false

        field :code_resource, Types::CodeResourceType, null: false
        field :code_resource_id, ID, null: false
        
        field :assignment_required_code_resource, Types::AssignmentRequiredCodeResourceType, null: false
        field :assignment_required_code_resource_id, ID, null: false
    end
end