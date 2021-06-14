FactoryBot.define do
  factory :assignment_submission do
    association :anssigment, factory: :anssigment
  end
end
