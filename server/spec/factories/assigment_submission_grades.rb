FactoryBot.define do
  factory :assigment_submission_grade do
    feedback { "MyText" }
    grade { 1 }

    association :user, factory: :user
    association :assigment_submission, factory: :assigment_submission
  end
end
