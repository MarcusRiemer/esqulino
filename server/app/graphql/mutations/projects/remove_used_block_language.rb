class Mutations::Projects::RemoveUsedBlockLanguage < Mutations::Projects::Projects
  argument :used_block_language_id, ID, required: true

  def resolve(**args)
    used = ProjectUsesBlockLanguage.find(args[:used_block_language_id]);
    p = used.project

    authorize p, :update?
    used.destroy!
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    return ({
      errors: [e]
    })
  end
end