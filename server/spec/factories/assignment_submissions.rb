FactoryBot.define do
  factory :assignment_submission do
    association :assignment, factory: :assignment
  end
end
