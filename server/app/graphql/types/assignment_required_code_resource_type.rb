module Types
    class Types::AssignmentRequiredCodeResourceType < Types::Base::BaseObject
        field :id, ID, null: false

        field :name, String, null: false
        field :description, String, null: true

        
        field :assignment_id, ID, null: false
        field :assignment, Types::AssignmentType, null: false

        field :template, Types::AssignmentTemplateCodeResourceType, null: true

        field :solution, Types::CodeResourceType, null: true
        field :code_resource_id, ID, null: true

        field :programming_language, Types::ProgrammingLanguageType, null: false
        field :programming_language_id, ID, null: false

        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true
    end
end