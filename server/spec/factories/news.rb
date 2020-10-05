FactoryBot.define do
  factory :news do
    title {
      {
        'de' => "Schlagzeile",
        'en' => "Headline"
      }
    }
    text {
      {
        'de' => "Das ist ein Test",
        'en' => "This is a test"
      }
    }
    published_from { Date.new(2019, 4, 10) }
    association :user
  end
end
