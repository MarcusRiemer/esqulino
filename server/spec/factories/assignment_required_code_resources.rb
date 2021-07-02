FactoryBot.define do
  factory :assignment_required_code_resource do
    resource_type { "MyText" }
    association :assignment, factory: :assignment
  end
end
