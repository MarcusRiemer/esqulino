class ProjectSource < ApplicationRecord
  belongs_to :project

  def type
    "data"
  end

  # Returns a nicely readable representation of id and type
  def readable_identification
    "\"#{url}\" (#{id})"
  end
end
