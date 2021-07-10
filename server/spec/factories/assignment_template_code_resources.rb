FactoryBot.define do
  factory :assignment_template_code_resource do
    association :code_resource, factory: :code_resource
    association :assignment_required_code_resource, factory: :assignment_required_code_resource
    reference_type {"given_partially"}
  end
end
