class Role < ApplicationRecord
  COMMON_NAMES = Set.new(%w[admin guest validated news_editor])

  COMMON_NAMES.merge(%w[spec test]) if Rails.env.test?

  validates :name,
            uniqueness: true,
            inclusion: { in: COMMON_NAMES }
end
