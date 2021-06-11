module Types
    class Types::AssigmentType < Types::Base::BaseObject
        field :id, ID, null: false

        field :name, String, null: false
        field :description, String, null: true
        field :assigment_submission, [Types::AssigmentSubmissionType], null: true
        field :project_id, ID, null: true
        field :project, Types::ProjectType, null: true
        field :start_date, GraphQL::Types::ISO8601DateTime, null: true
        field :end_date, GraphQL::Types::ISO8601DateTime, null: true

        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end