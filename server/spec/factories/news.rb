FactoryBot.define do
  factory :news do
    title do
      {
        'de' => 'Schlagzeile',
        'en' => 'Headline'
      }
    end
    text do
      {
        'de' => 'Das ist ein Test',
        'en' => 'This is a test'
      }
    end
    published_from { Date.new(2019, 4, 10) }
    association :user
  end
end
