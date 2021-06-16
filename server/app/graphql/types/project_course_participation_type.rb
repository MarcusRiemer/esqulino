module Types
    class Types::ProjectCourseParticipationType < Types::Base::BaseObject
        field :solution_project, Types::ProjectType, null: false
        field :assignment_project, Types::ProjectType, null: false
    end
end