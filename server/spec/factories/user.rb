# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:display_name) { |n| "user #{n}" }
    email {}

    trait :validated do
      roles { [Role.find_or_create_by(name: 'validated')] }
    end

    trait :guest do
      id { User.guest_id }
      display_name { 'Guest' }
      roles { [Role.find_or_create_by(name: 'guest')] }
    end

    trait :system do
      id { User.system_id }
      display_name { 'System' }
      roles { [Role.find_or_create_by(name: 'admin')] }
    end

    trait :admin do
      roles { [Role.find_or_create_by(name: 'admin')] }
    end
  end
end
