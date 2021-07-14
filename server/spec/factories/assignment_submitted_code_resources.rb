FactoryBot.define do
  factory :assignment_submitted_code_resource do
    association :code_resource, factory: :code_resource
    association :assignment_submission, factory: :assignment_submission
  end
end
