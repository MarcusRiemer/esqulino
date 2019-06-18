FactoryBot.define do
  factory :user do
    display_name { "Blattwerkzeug" }
    email { }
    
    trait :without_name do
      display_name { "" }
    end
  end
end
