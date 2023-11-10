OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  config = Rails.application.config_for :sqlino
  domain = config['editor_domain']

  # See which providers are configure, fall back to password
  auth_providers = Set.new(config.fetch(:auth_provider))

  configure do |config|
    config.full_host = Rails.env.production? ? "https://#{domain}" : "http://#{domain}"
    config.path_prefix = '/api/auth'
  end

  provider :developer, fields: %i[name email], uid_field: :email if auth_providers.include? 'Identity::Developer'

  if auth_providers.include? 'Identity::Keycloak'
    provider :keycloak_openid,
             'blattwerkzeug-omniauth',
             nil, # No secret required
             client_options: {
               site: config[:auth_provider_keys][:keycloak_site],
               realm: config[:auth_provider_keys][:keycloak_realm]
             }
  end
end
