FactoryBot.define do
  factory :block_language, class: BlockLanguage do
    name "Spec Block Language"
    model ({
             editorBlocks: [],
             sidebarBlocks: []
           })
    family "Spec Family"
  end
end
