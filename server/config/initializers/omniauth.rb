OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  config = Rails.application.config_for :sqlino
  domain = config["editor_domain"]

  # See which providers are configure, fall back to password
  auth_providers = Set.new(config.fetch(:auth_provider))

  configure do |config|
    config.full_host = Rails.env.production? ? "https://#{domain}" : "http://#{domain}"
    config.path_prefix = '/api/auth'
  end

  if auth_providers.include? "Identity::Developer"
    provider :developer, :fields => [:name, :email], :uid_field => :email
  end

  if auth_providers.include? "Identity::Google"
    provider :google_oauth2,
             config[:auth_provider_keys][:google_id],
             config[:auth_provider_keys][:google_secret],
             prompt: "consent"
  end

  if auth_providers.include? "Identity::Keycloak"
    provider :keycloak_openid,
             "blattwerkzeug-omniauth",
             nil, # No secret required
             client_options: {
               site: config[:auth_provider_keys][:keycloak_site],
               realm: config[:auth_provider_keys][:keycloak_realm]
             }
  end
end
