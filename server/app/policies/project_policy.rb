class ProjectPolicy < ApplicationPolicy
  attr_reader :user, :project

  def initialize(user, project)
    @user = user
    @project = project
  end

  def create?
    user.has_role?(:validated) || user.has_role?(:admin)
  end

  def update?
    user.owner_of?(project) || user.has_role?(:admin)
  end

  def destroy?
    user.owner_of?(project) || user.has_role?(:admin)
  end

  # May the user add a code resource in this project?
  def create_code_resource?
    user.owner_of?(project) || user.has_role?(:admin)
  end

  # May the user persist the current state of the project to the seed data?
  # If this is permitted, the stored data may end up in git.
  def store_seed?
    user.has_role?(:admin)
  end

  def add_member?
    permitted_roles = %w[admin owner]
    user_role = project.member_role(user)

    user.has_role?(:admin) || project.user_have_role(user, permitted_roles) || project.public && user_role == 'participant'
  end

  def change_member_role?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def remove_member?
    permitted_roles = %w[admin owner participant]

    project.user_have_role(user, permitted_roles)
  end

  def change_owner?
    permitted_roles = ['owner']

    project.user_have_role(user, permitted_roles)
  end

  def create_deep_copy?
    true
  end

  def create_update_assignment?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def destroy_assignment?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def create_assignment_submission?
    permitted_roles = %w[admin owner participant]

    project.user_have_role(user, permitted_roles)
  end

  def create_assignment_submission_grade?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def create_course_participation?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles) || project.public && user.present?
  end

  def create_update_assignment_required_code_resource?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def destroy_assignment_required_code_resource?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def create_project_course_participation?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles) # || project.public && user.present?
  end

  def create_assignment_submitted_code_resource?
    permitted_roles = %w[participant owner]

    project.user_have_role(user, permitted_roles)
  end

  def destroy_assignment_submitted_code_resource?
    permitted_roles = %w[participant owner]

    project.user_have_role(user, permitted_roles)
  end

  def destroy_project_course_participation?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  def update_project_course_participation?
    permitted_roles = %w[admin owner]

    project.user_have_role(user, permitted_roles)
  end

  class Scope < Scope
    def resolve
      if user.has_role?(:admin)
        Project.all
      else
        Project.only_public
      end
    end
  end
end
