module Types
  class Types::ProjectType < Types::Base::BaseObject
    field :id, ID, null: false
    field :name, Types::Scalar::LangJson, null: false
    field :description, Types::Scalar::LangJson, null: false
    field :public, Boolean, null: true
    field :preview, String, null: true
    field :index_page_id, String, null: true
    field :slug, String, null: true
    field :assignments, [Types::AssignmentType], null: true, resolver: Resolvers::ProjectInstanceAssignmentResolver
    

    field :course_template, Boolean, null: true
    field :enrollment_start, GraphQL::Types::ISO8601DateTime, null: true
    field :enrollment_end, GraphQL::Types::ISO8601DateTime, null: true
    field :max_group_size, Integer, null: true
    field :max_number_of_groups, Integer, null: true

    class SelectionGroupTypeEnum < Types::Base::BaseEnum
      value 'fixed_number_of_groups'
      value 'as_many_groups_as_was_created'
      value 'no_group_number_limitation'
      value 'self_selection'
    end

    field :selection_group_type, SelectionGroupTypeEnum, null: true

    field :default_database, Types::ProjectDatabaseType, null: true
    field :default_database_id, ID, null: true

    field :user, Types::UserType, null: true
    field :user_id, ID, null: true

    # TODO: Remove this, there must only be one path to sensitive information
    field :members, [Types::UserType], null: false
    field :project_members,
          [Types::ProjectMemberType],
          null: false,
          resolver: Resolvers::ProjectInstanceMemberResolver

    field :is_course, Boolean, null: false
    field :is_participant_course, Boolean, null: false
    field :assignment_submissions, [Types::AssignmentSubmissionType], null: true
    field :assignment_submitted_code_resources, [Types::AssignmentSubmittedCodeResourceType], null: true

    field :based_on_project, Types::ProjectType, null: true

    field :participant_projects, [Types::ProjectType], null: true
    field :based_on_project_course_participation, Types::ProjectCourseParticipationType, null: true
    field :participant_project_course_participations, [Types::ProjectCourseParticipationType], null: true

    field :code_resources, [Types::CodeResourceType], null: false
    field :code_resource_count, Integer, null: true
    field :project_sources, [Types::ProjectSourceType], null: false
    field :block_languages, [Types::BlockLanguageType], null: false
    field :project_uses_block_languages, [Types::ProjectUsesBlockLanguageType], null: false
    field :grammars, [Types::GrammarType], null: false

    field :schema, [Types::SqlTableType], null: false

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    def code_resource_count
      # code_resource_count defined in projects_resolver.rb
      object.code_resource_count
    end

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'ProjectOrderFieldEnum'
      # Order Fields
      value 'name'
      value 'slug'
      value 'createdAt', value: 'created_at'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'ProjectOrderType'
      argument :order_field, OrderFieldEnum, required: false
      argument :order_direction, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'ProjectMultilingualColumnsEnum'
      value 'name'
      value 'description'
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'ProjectFilterFieldType'
      argument :id, type: ID, required: false
      argument :user_id, type: ID, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :public, type: Boolean, required: false
      argument :is_course, type: Boolean, required: false
      argument :is_member, type: Boolean, required: false
      argument :is_not_participant_of_course, type: Boolean, required: false
      argument :is_participant_course, type: Boolean, required: false
      argument :is_not_participant_course, type: Boolean, required: false
      argument :course_template, type: Boolean, required: false
      argument :is_associated, type: Boolean, required: false
      argument :omit_associated, type: Boolean, required: false
      argument :enrollment_period_valid, type: Boolean, required: false
      
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'ProjectInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end
  end
end
