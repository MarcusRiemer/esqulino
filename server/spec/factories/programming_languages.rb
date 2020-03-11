FactoryBot.define do
  factory :programming_language do
    sequence (:id) { |n| "lang_#{n}" }
    sequence (:name) { |n| "Language #{n}" }

    trait :meta_grammar do
      id { 'meta-grammar' }
      name { 'Meta Grammar' }
    end

    trait :sql do
      id { 'sql' }
      name { 'SQL' }
    end
  end
end
