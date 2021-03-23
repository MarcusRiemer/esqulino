class Mutations::CodeResource::Update < Mutations::BaseMutation
  def self.default_graphql_name
    "CodeResourceUpdate"
  end


  argument :id, ID, required: true
  argument :name, String, required: true
  argument :ast, Types::Scalar::NodeDescription, required: false
  argument :block_language_id, ID, required: true
  argument :programming_language_id, ID, required: true

  field :code_resource, Types::CodeResourceType, null: false

  def resolve(id:, name:, ast:, block_language_id:, programming_language_id:)
    resource = CodeResource.find_by!(id: id)

    # Making changes to the code resource **must** be accompanied by
    # changes in deriving resources, otherwise the system could get out
    # of sync quite badly.
    result = ApplicationRecord.transaction do
      # Do the actual update of the code resource
      resource.attributes = {
        name: name,
        ast: ast,
        block_language_id: block_language_id,
        programming_language_id: programming_language_id
      }

      resource_changed = resource.changed?
      resource.save!

      if resource_changed
        # Do updates on dependant resources
        affected = resource.regenerate_immediate_dependants!
        affected.each { |a| a.save! }
      end
    end

    return {
      code_resource: resource
    }
  end
end