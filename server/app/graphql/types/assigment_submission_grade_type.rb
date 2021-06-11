module Types
    class Types::AssigmentSubmissionGradeType < Types::Base::BaseObject
        field :id, ID, null: false

        field :name, String, null: false
        field :feedback, String, null: false
        field :grade, Integer, null: false

        field :user_id, ID, null: false
        field :user, Types::UserType, null: false

        field :auditees, [Types::UserType], null: false
     
        field :assigment_submission, Types::AssigmentSubmissionType, null: false

        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
  end