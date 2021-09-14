class Mutations::Projects::UpdateProject < Mutations::Projects::Projects
  argument :id, ID, required: true

  argument :name, Types::Scalar::LangJson, required: false
  argument :description, Types::Scalar::LangJson, required: false
  argument :slug, String, required: false
  argument :preview, ID, required: false
  argument :slug, String, required: false

  argument :maxGroupSize, Integer, required: false
  argument :maxNumberOfGroups, Integer, required: false
  argument :selectionGroupType, Integer, required: false

  field :project, Types::ProjectType, null: false

  def resolve(**args)
    project = Project.find_by_slug_or_id! args[:id]
    authorize project, :update?

    raise ArgumentError, 'The maximum number of groups must not be less than 0' if maxGroupSize.is_present? && maxGroupSize < 0

    raise ArgumentError, 'The maximum number of groups must not be less than 0' if maxNumberOfGroups.is_present? && maxNumberOfGroups < 0

    args = underscore_keys(args)
    project.assign_attributes(args)

    project.save!

    { project: project, errors: [] }
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    { errors: [e] }
  rescue ActiveRecord::InvalidForeignKey, ActiveRecord::RecordInvalid
    { errors: project.errors.full_messages }
  end
end
