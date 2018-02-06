FactoryBot.define do
  factory :programming_language do
    sequence (:id) { |n| "lang_#{n}" }
    sequence (:name) { |n| "Language #{n}" }
  end
end
