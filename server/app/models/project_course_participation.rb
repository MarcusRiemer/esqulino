class ProjectCourseParticipation < ApplicationRecord
    # Thats one of the participant group
    belongs_to :assignments_project, class_name: 'Project'
   
    # Thats the project with all the assignments
    belongs_to  :solution_project, class_name: 'Project' 

    def getAssignments()
        return solution_project.assigments
    end
    
end