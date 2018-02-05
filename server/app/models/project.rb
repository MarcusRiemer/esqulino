class Project < ApplicationRecord
  has_many :project_sources, dependent: :destroy
  has_many :code_resources

  validates :slug, uniqueness: true

  scope :full, -> { includes(:project_sources, :code_resources) }
  
  def to_param
    "#{slug}"
  end
end
