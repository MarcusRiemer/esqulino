FactoryBot.define do
  factory :project, class: Project do
    sequence(:name) { |n| "Spec Project ##{n}"}
    slug { name.parameterize }
    description "Generated on the fly, used for tests"
    index_page_id nil
    public true
  end
end
