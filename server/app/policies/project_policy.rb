class ProjectPolicy < ApplicationPolicy
  attr_reader :user, :project

  def initialize(user, project)
    @user = user
    @project = project
  end

  def list_all?
    user.has_role?(:admin)
  end

  def create?
    user.has_role?(:user) || user.has_role?(:admin)
  end

  def update?
    user.owner_of?(project) || user.has_role?(:project_editor, project) || user.has_role?(:admin)
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
