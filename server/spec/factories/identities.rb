FactoryBot.define do
  factory :identity, class: Identity::Identity do
    provider {}
    uid {}
    own_data { {} }
    provider_data { {} }
    association :user
  end

  factory :developer_provider, class: Identity::Developer, parent: :identity do
    provider { 'developer' }
    sequence(:uid) { |n| "developer#{n}" }

    trait :new do
      provider { 'developer' }
      uid { 'developer@web.de' }
      provider_data do
        {
          credentials: {
            expires: false
          }
        }
      end
    end

    trait :existing do
      provider { 'developer' }
      uid { 'developer@blattwerkzeug.de' }
      provider_data do
        {
          credentials: {
            expires: false
          }
        }
      end
    end
  end
end
