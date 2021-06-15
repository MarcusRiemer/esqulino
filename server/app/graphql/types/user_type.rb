module Types
  class Types::UserType < Types::Base::BaseObject
    field :id, ID, null: false
    field :roles, Types::RoleType, null: false
    field :display_name, String, null: true
    field :email, String, null: true
    field :projects, [Types::ProjectType], null: true
    field :member_at, [Types::ProjectType], null: false
    field :project_members, [Types::ProjectMemberType], null: false
    field :identities, [Types::IdentityType], null: true
    field :news, [Types::NewsType], null: true
    field :grades, [Types::AssignmentSubmissionGradeType], null: true
    field :assignment_submission_grades, [Types::AssignmentSubmissionGradeType], null: true

  field :member_at, [Types::ProjectType], null: false
  field :project_members, [Types::ProjectMemberType], null: false

  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

  class OrderFieldEnum < Types::Base::BaseEnum
    graphql_name 'UserOrderFieldEnum'
    value 'id'
    value 'displayName', value: "display_name"
    value 'email'
  end

  class OrderType < Types::Base::BaseInputObject
    graphql_name 'UserOrderType'
    argument :order_field, OrderFieldEnum, required: false
    argument :order_direction, Types::Base::BaseEnum::OrderDirectionEnum, required: false
  end

  class FilterFieldType < Types::Base::BaseInputObject
    graphql_name 'UserFilterFieldType'
    argument :id, type: ID, required: false
    argument :display_name, type: String, required: false
    argument :email, type: String, required: false
  end

  class InputType < Types::Base::BaseInputObject
    graphql_name 'UserInputType'
    argument :order, OrderType, required: false
    argument :filter, FilterFieldType, required: false
    argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
  end
end
end
