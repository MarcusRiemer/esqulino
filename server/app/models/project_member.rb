class ProjectMember < ApplicationRecord
  belongs_to :user
  belongs_to :project

  # Represent the possible Member Type of a group
  enum membership_type: {
    admin: 0,
    participant: 1
  }
end
