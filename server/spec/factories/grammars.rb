FactoryBot.define do
  factory :grammar do
    name { "Spec Grammar" }
    sequence (:slug) { |n| "grammar-#{n}" }
    association :programming_language
    types { Hash.new }
    foreign_types { Hash.new }

    # A grammar that has a single type that is the root
    trait :model_single_type do
      types {
        {
          "spec" => {
            "root" => {
              "type" => "concrete",
              "attributes" => []
            }
          }
        }
      }
      root {
        {
          "languageName" => "spec",
          "typeName" => "root"
        }
      }
    end

    # A grammar that is generated from a code resource
    trait :generated_model_single_type do
      association :generated_from, factory: [:code_resource, :grammar_single_type]
    end
  end
end
