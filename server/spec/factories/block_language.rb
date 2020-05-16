FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name { "Spec Block Language" }
    sequence (:slug) { |n| "block_lang_#{n}" }
    model {
      ({
         editorBlocks: [],
         sidebars: [],
         editorComponents: [],
         rootCssClasses: [],
       })
    }
    association :default_programming_language, factory: :programming_language
    association :grammar, factory: :grammar

    trait :auto_generated_blocks do
      model {
        ({
           editorBlocks: [],
           sidebars: [],
           editorComponents: [],
           rootCssClasses: [],
           localGeneratorInstructions: {
             type: "tree"
           }
         })
      }
    end
  end
end
