FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name "Spec Block Language"
    sequence (:slug) { |n| "block_lang_#{n}" }
    model ({
             editorBlocks: [],
             sidebars: []
           })
    family "Spec Family"
  end
end
