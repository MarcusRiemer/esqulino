module Types
    class Types::ProjectCourseParticipationType < Types::Base::BaseObject
        field :id, ID, null: false
        
        field :based_on_project, Types::ProjectType, null: false
        field :participant_project, Types::ProjectType, null: false
    end
end