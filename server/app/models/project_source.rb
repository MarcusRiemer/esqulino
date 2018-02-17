class ProjectSource < ApplicationRecord
  belongs_to :project

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_return = to_json_api_response.slice("type", "url", "display", "readOnly")

    to_return['type'] = "data"

    to_return
  end
end
