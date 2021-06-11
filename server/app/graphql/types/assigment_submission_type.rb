module Types
    class Types::AssigmentSubmissionType < Types::Base::BaseObject
        field :id, ID, null: false

        field :assigment_id, ID, null: false
        field :assigment, Types::AssigmentType, null: false

        field :assigment_submission_grade_id, ID, null: true
        field :assigment_submission_grade, Types::AssigmentSubmissionGradeType, null: true

        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end