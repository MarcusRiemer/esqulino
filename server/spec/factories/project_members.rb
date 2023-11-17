# frozen_string_literal: true

FactoryBot.define do
  factory :project_member do
    association :user, factory: :user
    association :project, factory: :project
    membership_type { 'admin' }
  end
end
