
FactoryBot.define do

  factory :identity, class: 'Identity' do
    provider {}
    uid {}
    data {}
    association :user
  end

  factory :identity_provider, class: "PasswordIdentity", parent: :identity do
    trait :new do
      provider { "identity" }
      uid { "identity@web.de" }
      data { ({
        email: "identity@web.de",
        password: BCrypt::Password.create("1234567"),
        verify_token: SecureRandom.uuid,
        confirmed: false
      }) }
    end

    trait :existing do
      provider { "identity" }
      uid { "blattwerkzeug@web.de" }
      data { ({
        email: "blattwerkzeug@web.de",
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
      data { ({
        email: "another@web.de",
        password: BCrypt::Password.create("12345678"),
        verify_token: SecureRandom.uuid,
        confirmed: true,
        password_reset_token: SecureRandom.uuid,
        password_reset_token_exp: Time.now - 1.hour
      }) }
    end
  end

  factory :developer_provider, class: "Developer", parent: :identity do
    trait :new do
      provider { "developer" }
      uid { "developer@web.de" }
    end

    trait :existing do
      provider { "developer" }
      uid { "developer@blattwerkzeug.de" }
    end
  end

  factory :google_provider, class: "Google", parent: :identity do
    trait :new do
      provider { "google" }
      uid { "google@gmail.de" }
    end
  end


  # trait :new_google_provider do
  #   provider { "google" }
  #   uid { "google@blattwerkzeug.de" }
  # end
end
