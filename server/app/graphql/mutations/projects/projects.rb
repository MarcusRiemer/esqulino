class Mutations::Projects::Projects < Mutations::BaseMutation

  field :id, ID, null: true
  field :errors, [String], null: false

  def save_project(project)
    if project.save
      {
          id: project.id,
          errors: []
      }
    else
      {
          id: nil,
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


