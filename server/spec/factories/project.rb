FactoryBot.define do
  factory :project do
    name "Spec Project"
    slug "spec-proejct"
  end

  factory :proejct_source do
    project
    title "awesome proejct"
    display "wow! all the data has be scraped"
  end
end