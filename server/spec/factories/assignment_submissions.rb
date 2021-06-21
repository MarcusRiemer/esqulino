FactoryBot.define do
  factory :assignment_submission do
    association :assignment, factory: :assignment
    association :project, factory: :project
  end
end
