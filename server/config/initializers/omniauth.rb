OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.full_host = Rails.env.production? ? 'https://blattwerkzeug.de' : 'http://localhost:9292'
  configure do |config|
    config.path_prefix = '/api/auth'
  end
  provider :identity, :on_registration => AuthController.action(:register), :on_login => AuthController.action(:login_with_password)
  provider :developer, :fields => [:name, :email], :uid_field => :email unless Rails.env.production?
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET']
  provider :github, ENV['GITHUB_CLIENT_ID'], ENV['GITHUB_CLIENT_SECRET']
end
