FactoryBot.define do
  factory :member do
    accepts { false }
    user { nil }
    project { nil }
  end
end
