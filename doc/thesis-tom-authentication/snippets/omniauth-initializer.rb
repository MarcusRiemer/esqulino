Rails.application.config.middleware.use OmniAuth::Builder do
	provider :identity, :on_registration => AuthController.action(:register),
						:on_login => AuthController.action(:login_with_password), :model => PasswordIdentity
	provider :developer, :fields => [:name, :email], :uid_field => :email unless Rails.env.production?
	provider :google_oauth2, GOOGLE_ID, GOOGLE_SECRET
	provider :github, GITHUB_ID, GITHUB_ID
end
