class Mutations::Projects::AddUsedBlockLanguage < Mutations::Projects::Projects
  argument :project_id, ID, required: true
  argument :block_language_id, ID, required: true

  class Response < Types::Base::BaseObject
    field :block_language, Types::BlockLanguageType, null: false
    field :project_uses_block_language, Types::ProjectUsesBlockLanguageType, null: false
  end

  field :result, Response, null: true

  def resolve(**args)
    p = Project.find_by_slug_or_id!(args[:project_id])
    authorize p, :update?

    b = BlockLanguage.find(args[:block_language_id])

    uses = p.project_uses_block_languages.create(block_language: b)

    {
      result: {
        project_uses_block_language: uses,
        block_language: b
      }
    }
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    ({
      errors: [e]
    })
  end
end
