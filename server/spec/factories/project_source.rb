FactoryBot.define do
  factory :project_source do
    sequence(:title) { |n| "Source #{n}" }
    sequence(:display) { |n| "This is source number #{n}" }
    url { 'http://example.com/' }
    association :project, factory: :project
  end
end
