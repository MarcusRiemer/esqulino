class ProjectPolicy
	attr_reader :user, :project

	def initialize(user, project)
		@user = user
		@project = project
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
end
