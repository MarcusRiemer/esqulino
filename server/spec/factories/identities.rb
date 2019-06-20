
FactoryBot.define do

  factory :identity do
    provider {}
    uid {}
    data {}
    association :user

    trait :new_identity_provider do
      provider { "identity" }
      uid { "identity@web.de" }
      data ({
        email: "identity@web.de",
        password: BCrypt::Password.create("1234567"),
        verify_token: SecureRandom.uuid,
        confirmed: false
      })
    end

    trait :existing_identity_provider do
      provider { "identity" }
      uid { "blattwerkzeug@web.de" }
      data ({
        email: "blattwerkzeug@web.de",
        password: BCrypt::Password.create("12345678"),
        verify_token: SecureRandom.uuid,
        confirmed: true,
        password_reset_token: SecureRandom.uuid,
        password_reset_token_exp: Time.now - 1.hour
      })
    end

    trait :new_developer_provider do
      provider { "developer" }
      uid { "developer@web.de" }
    end

    trait :existing_developer_provider do
      provider { "developer" }
      uid { "developer@blattwerkzeug.de" }
    end

    trait :new_google_provider do
      provider { "google" }
      uid { "google@blattwerkzeug.de" }
    end
  
  end
end
