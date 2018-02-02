class Project < ApplicationRecord
  has_many :project_sources, dependent: :destroy
  has_many :code_resources

  validates :slug, uniqueness: true
  
  def to_param
    "#{slug}"
  end
end
