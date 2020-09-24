FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name { "Spec Block Language" }
    sequence (:slug) { |n| "block_lang_#{n}" }
    editor_blocks { [] }
    sidebars { [] }
    editor_components { [] }
    root_css_classes { [] }
    association :default_programming_language, factory: :programming_language
    association :grammar, factory: :grammar

    trait :auto_generated_blocks do
      local_generator_instructions { ({type: "tree" }) }
    end

    trait :grammar_meta do
      association :grammar, factory: [:grammar, :model_meta]
    end

    trait :grammar_code_resource_references do
      association :grammar, factory: [:grammar, :model_spec_code_resource_references]
    end
  end
end
