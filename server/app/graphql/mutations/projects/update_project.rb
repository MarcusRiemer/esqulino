class Mutations::Projects::UpdateProject < Mutations::Projects::Projects
  argument :id, ID, required: true

  argument :name, Types::Scalar::LangJson, required: false
  argument :description, Types::Scalar::LangJson, required: false
  argument :slug, String, required: false
  argument :preview, ID, required: false

  field :project, Types::ProjectType, null: false

  def resolve(**args)
    project = Project.find_by_slug_or_id! args[:id]
    authorize project, :update?

    args = underscore_keys(args)
    project.assign_attributes(args)

    project.save!

    { project:, errors: [] }
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    { errors: [e] }
  rescue ActiveRecord::InvalidForeignKey, ActiveRecord::RecordInvalid
    { errors: project.errors.full_messages }
  end
end
