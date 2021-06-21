FactoryBot.define do
  factory :project_course_participation do
    access_denied { false }
    association :solution_project, {factory: :project, slug: nil}
    association :assignments_project, {factory: :project, slug: nil}
  end
end
