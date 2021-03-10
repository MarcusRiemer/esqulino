class Mutations::CreateCodeResource < Mutations::BaseMutation
  argument :name, String, required: true
  argument :project_id, ID, required: true
  argument :block_language_id, ID, required: true
  argument :programming_language_id, ID, required: true

  field :code_resource, Types::CodeResourceType, null: false

  def resolve(**args)
    return {
      code_resource: CodeResource.create!(args)
    }
  end
end
