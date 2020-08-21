class Mutations::Projects::CreateProject < Mutations::Projects::Projects

  argument :name, Types::Scalar::LangJson, required: true
  argument :slug, String, required: true

  field :id, ID, null: true

  def resolve(**args)
    authorize :project, :create?

    project = Project.new(
      name: args[:name],
      slug: args[:slug],
      user_id: current_user.id
    )

    if project.save
      ProjectMailer.with(project: project).created_admin.deliver_later
      {
        errors: [],
        id: project.id,
      }
    else
      {
        errors: project.errors.full_messages
      }
    end
  end
end
