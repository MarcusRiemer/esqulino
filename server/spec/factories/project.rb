FactoryBot.define do
  factory :project do
    sequence(:name) { |n| {"en" => "Spec Project #{n}"} }
    sequence(:slug) { |n| "project-#{n}" }
    description { {"en" => "Generated on the fly, used for tests" } }
    index_page_id { nil }
    public { false }
    association :user

    factory :project_with_default_database do
      after :create do |project|
        db = project.create_default_database(name: "default", project_id: project.id)
        db.save!
        project.save!
      end
    end
  end

  trait :public do
    public { true }
  end
  trait :private do
    public { false }
  end
end
