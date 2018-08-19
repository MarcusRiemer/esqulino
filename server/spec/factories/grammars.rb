FactoryBot.define do
  factory :grammar do
    name "Spec Grammar"
    sequence (:slug) { |n| "grammar_#{n}" }
    model ({
             "types": {
               "spec": { "type": "concrete" }
             },
             "root": "spec"
           })
  end
end
