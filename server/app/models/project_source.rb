class ProjectSource < ApplicationRecord
  belongs_to :project_structure, optional: true

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    self.serializable_hash.transform_keys! { |k| k.camelize(:lower) }
  end
end
