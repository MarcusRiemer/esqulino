FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name "Spec Block Language"
    sequence (:slug) { |n| "block_lang_#{n}" }
    model ({
             editorBlocks: [],
             sidebars: [],
             editorComponents: [],
           })
    association :default_programming_language, factory: :programming_language
    association :grammar, factory: :grammar
  end

  factory :generated_block_language, class: BlockLanguage do
    name "Generated Spec Block Language"
    sequence (:slug) { |n| "generated_block_lang_#{n}" }
    model ({
             editorBlocks: [],
             sidebars: [],
             editorComponents: [],
             localGeneratorInstructions: {}
           })
    association :default_programming_language, factory: :programming_language
    association :grammar, factory: :grammar
  end
end
