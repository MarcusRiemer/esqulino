FactoryBot.define do
  factory :grammar do
    name "Spec Grammar"
    sequence (:slug) { |n| "grammar_#{n}" }
    model ({
             "types": {
               "spec": { }
             },
             "root": "spec"
           })
  end
end
