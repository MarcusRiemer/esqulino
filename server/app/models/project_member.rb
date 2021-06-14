class ProjectMember < ApplicationRecord
  # The user who joins the project
  belongs_to :user

  # The project to which the user belongs
  belongs_to :project

  #Represent the possible Member Type of a group
  enum membership_type: {
    admin: 0,
    participant: 1
  }
end
