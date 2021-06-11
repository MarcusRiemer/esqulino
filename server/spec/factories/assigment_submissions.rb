FactoryBot.define do
  factory :assigment_submission do
    association :assigment, factory: :assigment
  end
end
