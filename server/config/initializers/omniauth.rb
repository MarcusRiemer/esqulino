OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  config = Rails.application.config_for :sqlino
  domain = config["editor_domain"]

  configure do |config|
    config.full_host = Rails.env.production? ? "https://#{domain}" : "http://#{domain}"
    config.path_prefix = '/api/auth'
  end
  provider :identity, :fields => [], :on_registration => AuthController.action(:register), :on_login => AuthController.action(:login_with_password), :model => PasswordIdentity
  provider :developer, :fields => [:name, :email], :uid_field => :email unless Rails.env.production?
  provider :google_oauth2, config["auth_provider_keys"]["google_id"], config["auth_provider_keys"]["google_secret"]
  provider :github, config["auth_provider_keys"]["github_id"], config["auth_provider_keys"]["github_secret"]
end
