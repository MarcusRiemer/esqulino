class Mutations::Projects::Projects < Mutations::BaseMutation

  field :project, Types::ProjectType, null: true
  field :errors, [String], null: false

  def save_project(project)
    if project.save
      {
          project: project,
          errors: []
      }
    else
      {
          project: nil,
          errors: project.errors.full_messages
      }
    end
  end

  def destroy_project(project)
    project.destroy!
    {
        project: nil,
        errors: []
    }
  end
end


