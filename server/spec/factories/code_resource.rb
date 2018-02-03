FactoryBot.define do
  factory :code_resource, class: CodeResource do
    name "Spec Code Resource"
    association :project, factory: :project
    association :block_language, factory: :block_language
  end
end
