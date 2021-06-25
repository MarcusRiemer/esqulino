class Role < ApplicationRecord
  COMMON_NAMES = Set.new(["admin", "guest", "validated", "news_editor"])

  if Rails.env.test?
    COMMON_NAMES.merge(["spec", "test"])
  end

  validates :name,
            uniqueness: true,
            inclusion: { in: COMMON_NAMES }
end
