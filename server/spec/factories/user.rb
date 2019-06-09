FactoryBot.define do
  factory :user do
    display_name { "Blattwerkzeug" }
    
    trait :without_name do
      display_name { "" }
    end
  end
end
