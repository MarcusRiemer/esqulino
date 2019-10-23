
FactoryBot.define do

  factory :identity, class: Identity::Identity do
    provider {}
    uid {}
    own_data { ({}) }
    provider_data { ({}) }
    association :user
  end

  factory :identity_provider, class: Identity::Password, parent: :identity do
    trait :new do
      provider { "identity" }
      uid { "identity@web.de" }
      provider_data { ({
        credentials: {
          expires: true,
          expires_at: 3.hours.from_now
        }
      }) }
      own_data { ({
        password: BCrypt::Password.create("1234567"),
        verify_token: SecureRandom.uuid,
        confirmed: false
      }) }
    end

    trait :existing do
      provider { "identity" }
      uid { "blattwerkzeug@web.de" }
      provider_data { ({
        name: "Tom",
        email: "blattwerkzeug@web.de",
        credentials: {
          expires: true,
          expires_at: 3.hours.from_now
        }
      }) }
      own_data { ({
        password: BCrypt::Password.create("12345678"),
        verify_token: SecureRandom.uuid,
        confirmed: true,
        password_reset_token: SecureRandom.uuid,
        password_reset_token_exp: Time.now - 1.hour
      }) }
    end

    trait :another_existing do
      provider { "identity" }
      uid { "another@web.de" }
      provider_data { ({
        name: "Tom",
        email: "another@web.de",
        credentials: {
          expires: true,
          expires_at: 3.hours.from_now
        }
      }) }
      own_data { ({
        password: BCrypt::Password.create("12345678"),
        verify_token: SecureRandom.uuid,
        confirmed: true,
        password_reset_token: SecureRandom.uuid,
        password_reset_token_exp: Time.now - 1.hour
      }) }
    end
  end

  factory :developer_provider, class: Identity::Developer, parent: :identity do
    trait :new do
      provider { "developer" }
      uid { "developer@web.de" }
      provider_data { ({
        credentials: {
          expires: false
        }
      }) }
    end

    trait :existing do
      provider { "developer" }
      uid { "developer@blattwerkzeug.de" }
      provider_data { ({
        credentials: {
          expires: false
        }
      }) }
    end
  end

  factory :google_provider, class: Identity::Google, parent: :identity do
    trait :new do
      provider { "google" }
      uid { "google@gmail.de" }
      provider_data { ({
        name: "Tom",
        email: "tom@gmail.com",
        email_verified: false,
        credentials: {
          expires: true,
          expires_at: 3.hours.from_now.to_i
        }
      }) }
    end

    trait :existing do
      provider { "google" }
      uid { "google@gmail.de" }
      provider_data { ({
        name: "Tom",
        email: "tom@gmail.com",
        email_verified: true,
        credentials: {
          expires: true,
          expires_at: 3.hours.from_now.to_i
        }
      }) }
    end
  end

  factory :github_provider, class: Identity::Github, parent: :identity do
    trait :new do
      provider { "github" }
      uid { "Stackoverflow is life" }
      provider_data { ({
        name: "Special-Name",
        credentials: {
          expires: false
        }
      }) }
    end

    trait :existing do
      provider { "github" }
      uid { "Stackoverflow is life" }
      provider_data { ({
        name: "Special-Name",
        email: "specialGitHubEmail@web.de",
        urls: {
          "Github" => "www.github.com/specialName"
        },
        credentials: {
          expires: false
        }
      }) }
    end
  end
end
