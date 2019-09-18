FactoryBot.define do
  factory :grammar do
    name { "Spec Grammar" }
    sequence (:slug) { |n| "grammar-#{n}" }
    association :programming_language, factory: :programming_language
    model {
      ({
         "types" => {
           "spec" => {
             "root" => {
               "type" => "concrete",
               "attributes" => []
             }
           }
         },
         "root" => {
           "languageName" => "spec",
           "typeName" => "root"
         }
       })
    }
  end
end
