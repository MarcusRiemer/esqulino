class Mutations::Projects::CreateProject < Mutations::Projects::Projects
  argument :name, Types::Scalar::LangJson, required: true
  argument :slug, String, required: false

  field :id, ID, null: true

  def resolve(name:, slug: nil)
    authorize :project, :create?

    # If the guest user creates a project: Attribute it to the system
    # user instead. Otherwise developers that use a guest account
    # with admin permissions may unintentionally publish world editable
    # projects
    owner_user_id = if current_user.guest?
                      User.system_id
                    else
                      current_user.id
                    end

    project = Project.new(
      name: name,
      slug: slug,
      user_id: owner_user_id
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
