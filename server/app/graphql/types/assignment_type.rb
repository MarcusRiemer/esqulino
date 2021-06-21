module Types
    class Types::AssignmentType < Types::Base::BaseObject
        field :id, ID, null: false

        field :name, String, null: false
        field :description, String, null: true
        field :assignment_submission, [Types::AssignmentSubmissionType], null: true
        field :assignment_required_code_resources, [Types::AssignmentRequiredCodeResourceType], null: true
        field :project_id, ID, null: true
        field :project, Types::ProjectType, null: true
        field :start_date, GraphQL::Types::ISO8601DateTime, null: true
        field :end_date, GraphQL::Types::ISO8601DateTime, null: true

        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end