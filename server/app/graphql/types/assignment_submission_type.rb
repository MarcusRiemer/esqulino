module Types
    class Types::AssignmentSubmissionType < Types::Base::BaseObject
        field :id, ID, null: false

        field :project_id, ID, null: false
        field :project, Types::ProjectType, null: false

        field :assignment_id, ID, null: false
        field :assignment, Types::AssignmentType, null: false

        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true

        field :assignment_submission_grade_id, ID, null: true
        field :assignment_submission_grade, Types::AssignmentSubmissionGradeType, null: true

        field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true

        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end