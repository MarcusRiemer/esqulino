FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name "Spec Block Language"
    sequence (:slug) { |n| "block_lang_#{n}" }
    model ({
             editorBlocks: [],
             sidebars: [],
             editorComponents: [],
           })
    family "Spec Family"
    association :default_programming_language, factory: :programming_language
  end
end
