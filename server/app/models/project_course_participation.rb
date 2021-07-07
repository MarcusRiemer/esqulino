class ProjectCourseParticipation < ApplicationRecord
    # Thats one of the participant group
    belongs_to :participant_project, class_name: 'Project'
   
    # Thats the project with all the assignments
    belongs_to  :based_on_project, class_name: 'Project' 

    def getAssignments()
        return based_on_project.assignments
    end
    
end