# frozen_string_literal: true

FactoryBot.define do
  factory :project_uses_block_language do
    association :project, factory: :project
    association :block_language, factory: :block_language
  end
end
