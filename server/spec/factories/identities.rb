FactoryBot.define do
  factory :identity do
    provider {}
    uid {}
    data {}
    user_id { }

    trait :identity_provider do
      provider { "identity" }
      uid { "identity@web.de" }
      data ({
        email: "identity@web.de",
        password: "1234567",
        verify_token: SecureRandom.uuid,
        confirmed: false
      })

      trait :confirmed do
        data ({
          confirmed: true
        })
      end

      trait :reset_password do
        data ({
          password_reset_token: SecureRandom.uuid,
          password_reset_token_exp: 1.hour.from_now
        })
      end
  
      trait :reset_password_expired do
        data ({
          password_reset_token: SecureRandom.uuid,
          password_reset_token_exp: Time.now - 1.hour
        })
      end
    end

    trait :existing_identity do
      provider { "identity" }
      uid { "blattwerkzeug@web.de" }
      data ({
        email: "blattwerkzeug@web.de",
        password: "12345678",
        verify_token: SecureRandom.uuid,
        confirmed: true,
        password_reset_token: SecureRandom.uuid,
        password_reset_token_exp: Time.now - 1.hour
      })

      trait :unconfirmed do
        data ({
          confirmed: false
        })
      end

      trait :reset_password do
        data ({
          password_reset_token: SecureRandom.uuid,
          password_reset_token_exp: 1.hour.from_now
        })
      end
  
      trait :reset_password_expired do
        data ({
          password_reset_token: SecureRandom.uuid,
          password_reset_token_exp: Time.now - 1.hour
        })
      end
    end

    trait :developer_provider do
      provider { "developer" }
      uid { "developer@web.de" }
    end

    trait :existing_developer do
      provider { "developer" }
      uid { "developer@blattwerkzeug.de" }
    end

    trait :google_provider do
      provider { "google" }
      uid { "google@blattwerkzeug.de" }
    end
  
  end
end
