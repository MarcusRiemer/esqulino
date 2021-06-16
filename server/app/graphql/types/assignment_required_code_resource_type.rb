module Types
    class Types::AssignmentRequiredCodeResourceType < Types::Base::BaseObject
        field :assignment, Types::AssignmentType, null: false
        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType]
        field :resource_type, String, null: false
    end
end