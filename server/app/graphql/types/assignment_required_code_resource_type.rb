module Types
    class Types::AssignmentRequiredCodeResourceType < Types::Base::BaseObject
        field :id, ID, null: false

        field :assignment_id, ID, null: false
        field :assignment, Types::AssignmentType, null: false
        
        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true
        field :resource_type, String, null: false
    end
end