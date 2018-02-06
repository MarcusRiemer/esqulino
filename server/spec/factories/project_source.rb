FactoryBot.define do
  factory :project_source do
    sequence (:title) { |n| "Source #{n}" }
    sequence (:display) { |n| "This is source number #{n}" }
  end
end
