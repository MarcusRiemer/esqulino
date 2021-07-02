module Types
    class Types::AssignmentRequiredCodeResourceType < Types::Base::BaseObject
        field :id, ID, null: false

        field :assignment_id, ID, null: false
        field :assignment, Types::AssignmentType, null: false

        field :assignment_template_code_resource, Types::AssignmentTemplateCodeResourceType, null: true

        #field :solution, Types::CodeResource, null: true
        field :code_resource_id, ID, null: true

        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true
        field :resource_type, String, null: false
    end
end