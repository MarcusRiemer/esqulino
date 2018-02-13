FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name "Spec Block Language"
    model ({
             editorBlocks: [],
             sidebars: []
           })
    family "Spec Family"
  end
end
