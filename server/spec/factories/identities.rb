FactoryBot.define do
  factory :identity, class: Identity::Identity do
    provider {}
    uid {}
    own_data { ({}) }
    provider_data { ({}) }
    association :user
  end

  factory :developer_provider, class: Identity::Developer, parent: :identity do
    provider { "developer" }
    sequence (:uid) { |n| "developer#{n}" }

    trait :new do
      provider { "developer" }
      uid { "developer@web.de" }
      provider_data {
        ({
          credentials: {
            expires: false
          }
        })
      }
    end

    trait :existing do
      provider { "developer" }
      uid { "developer@blattwerkzeug.de" }
      provider_data {
        ({
          credentials: {
            expires: false
          }
        })
      }
    end
  end

  factory :google_provider, class: Identity::Google, parent: :identity do
    provider { "google_oauth2" }
    sequence (:uid) { |n| "user#{n}@gmail.com" }

    trait :new do
      provider_data {
        ({
          name: "Tom",
          email: "tom@gmail.com",
          email_verified: false,
          credentials: {
            expires: true,
            expires_at: 3.hours.from_now.to_i
          }
        })
      }
    end

    trait :existing do
      provider_data {
        ({
          name: "Tom",
          email: uid,
          email_verified: true,
          credentials: {
            token: "a_google_access_token",
            refresh_token: "a_google_refresh_token",
            expires: true,
            expires_at: 3.hours.from_now.to_i
          }
        })
      }
    end

    trait :expired do
      provider_data {
        ({
          name: "Tom",
          email: uid,
          email_verified: true,
          credentials: {
            token: "a_google_access_token",
            refresh_token: "a_google_refresh_token",
            expires: true,
            expires_at: 3.hours.before.to_i
          }
        })
      }
    end

    trait :no_renew_credentials do
      provider_data {
        ({
          name: "Tom",
          email: uid,
          email_verified: true,
          credentials: {
            token: "a_google_access_token",
            expires: true,
            expires_at: 3.hours.before.to_i
          }
        })
      }
    end
  end
end
