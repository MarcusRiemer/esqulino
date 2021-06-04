module Types
    class Types::ProjectMemberType < Types::Base::BaseObject
        field :id, ID, null: false
        field :joined_at, GraphQL::Types::ISO8601DateTime, null: true
      
      field :user_id, ID, null: false
      field :user, Types::UserType, null: false
     
      field :project_id, ID, null: false
      field :project, Types::ProjectType, null: false

      field :created_at, GraphQL::Types::ISO8601DateTime, null: false
      field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

      class MembershipTypeEnum < Types::Base::BaseEnum
        value "admin"
        value "participant"
      end
      field :membership_type, MembershipTypeEnum, null: false
      
    end
    
  end