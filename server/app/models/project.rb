class Project < ApplicationRecord
  has_many :project_sources
  has_many :code_resources

  validates :slug, uniqueness: true
  
  def to_param
    "#{slug}"
  end

  def self.find(input)
    find_by_slug(input)
  end

end
