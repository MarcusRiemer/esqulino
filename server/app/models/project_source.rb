class ProjectSource < ApplicationRecord
  belongs_to :project

  # Returns a nicely readable representation of id and type
  def readable_identification
    "\"#{url}\" (#{id})"
  end

  # The kind is currently not encoded in the db
  def kind
    'data'
  end
end
