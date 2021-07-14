FactoryBot.define do
  factory :project_course_participation do
    access_denied { false }
    association :based_on_project, {factory: :project, slug: nil}
    association :participant_project, {factory: :project, slug: nil}
  end
end
