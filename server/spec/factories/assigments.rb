FactoryBot.define do
  factory :assigment do
    name { "MyString" }
    start_date { "2021-06-08 09:50:17" }
    end_date { "2021-06-08 09:50:17" }
    description { "MyText" }

    association :project, factory: :project
  end
end
