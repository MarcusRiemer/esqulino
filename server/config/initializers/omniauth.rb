OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.full_host = Rails.env.production? ? 'https://blattwerkzeug.de' : 'http://localhost:9292'
  configure do |config|
    config.path_prefix = '/api/auth'
  end
  provider :developer, :fields => [:name, :email], :uid_field => :email unless Rails.env.production?
  provider :google_oauth2, "50823651702-ac7sk3121616fhile3kvropmff2lmc5i.apps.googleusercontent.com", ENV['GOOGLE_CLIENT_SECRET']
end
