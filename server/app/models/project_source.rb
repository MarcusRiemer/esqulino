class ProjectSource < ApplicationRecord
  belongs_to :project

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_return = to_json_api_response.except("projectId")

    to_return['type'] = type
    to_return['id'] = to_return['id'].to_s # TODO: I should be a UUID

    to_return
  end

  def type
    "data"
  end

  # Returns a nicely readable representation of id and type
  def readable_identification
    "\"#{url}\" (#{id})"
  end
end
