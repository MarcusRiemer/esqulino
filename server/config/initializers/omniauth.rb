OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  configure do |config|
    config.path_prefix = '/api/auth'
  end
  provider :developer # unless Rails.env.production?
end
