FactoryBot.define do
  factory :code_resource, class: CodeResource do
    name "Spec Code Resource"
    association :project, factory: :project
    association :block_language, factory: :block_language
    association :programming_language, factory: :programming_language

    # Projects allow or disallow block languages. We need to ensure
    # that the created block language is allowed by the project
    after(:build) do |code_resource|
      if (code_resource.project and code_resource.block_language) then
        code_resource.project.block_languages << code_resource.block_language
      end
    end
  end
end
