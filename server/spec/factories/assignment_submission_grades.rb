FactoryBot.define do
  factory :assignment_submission_grade do
    feedback { "MyText" }
    grade { 1 }

    association :user, factory: :user
    association :assignment_submission, factory: :assignment_submission
  end
end
