FactoryBot.define do
  factory :assignment_required_code_resource do
    resource_type { ".txt" }
    name {"Zusammenfassung"}
    association :assignment, factory: :assignment
  end
end
