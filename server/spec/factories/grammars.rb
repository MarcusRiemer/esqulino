FactoryBot.define do
  factory :grammar do
    name { "Spec Grammar" }
    technical_name { "spec_g" }
    sequence (:slug) { |n| "grammar_#{n}" }
    association :programming_language, factory: :programming_language
    model {
      ({
         "types": {
                    "spec": { "type": "concrete", "attributes": [] }
                  },
        "root": "spec"
       })
    }
  end
end
