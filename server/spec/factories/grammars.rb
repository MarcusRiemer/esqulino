FactoryBot.define do
  factory :grammar do
    name "Spec Grammar"
    sequence (:slug) { |n| "grammar_#{n}" }
    association :programming_language, factory: :programming_language
    model ({
             "types": {
               "spec": { "type": "concrete" }
             },
             "root": "spec"
           })
  end
end
