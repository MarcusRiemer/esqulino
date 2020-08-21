class Mutations::Projects::DestroyProject < Mutations::Projects::Projects
  argument :id, ID, required: true

  def resolve(id:)
    project = Project.find_by_slug_or_id! id
    authorize project, :destroy?

    project.destroy!
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    {
      errors: [e]
    }
  end
end
