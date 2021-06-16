class ProjectCourseParticipation < ApplicationRecord
    # Thats the project with all the assignments
    has_one :solution_project, class_name: 'Project', :foreign_key => 'project_course_participation_id'

    # Thats one of the participant group
    belongs_to  :assignments_project, class_name: 'Project' 
end