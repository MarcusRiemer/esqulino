FactoryBot.define do
  factory :assignment_required_code_resource do
    name {"Zusammenfassung"}
    association :assignment, factory: :assignment
  end
end
