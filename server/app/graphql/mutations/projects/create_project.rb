class Mutations::Projects::CreateProject < Mutations::Projects::Projects
  argument :name, Types::Scalar::LangJson, required: true
  argument :slug, String, required: false

  field :id, ID, null: true

  def resolve(name:, slug: nil)
    authorize :project, :create?

    project = Project.new(
      name: name,
      slug: slug,
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
