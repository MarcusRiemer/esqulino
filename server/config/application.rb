require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "sprockets/railtie"
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Server
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # Cookie options according to configured domains
    editor_domain = Rails.application.config_for(:sqlino)["editor_domain"]
    # Without `http` scheme parser wont extract host
    cookie_domain = URI("http://" + editor_domain).host
    cookie_tld_length = cookie_domain.count(".")
    cookie_config = {
      key: '_blattwerkzeug_rails',
      domain: "." + cookie_domain, # Prepend "." to ensure that cookie is also valid for subdomains
      tld_length: cookie_tld_length
    }

    config.session_store :cookie_store, **cookie_config

    # Session storage and the following middleware is required for OmniAuth
    config.middleware.use ActionDispatch::Cookies # Required for all session management
    config.middleware.use ActionDispatch::Session::CookieStore, config.session_options

    # Make the cookie domain globally available
    config.cookie_domain = cookie_domain

    # Ensure that different domains as "localhost" or "blattwerkzeug.de"
    # lead to appropriate domain lengths.
    config.action_dispatch.tld_length = cookie_tld_length

    puts "Cookie Domain Configuration: #{cookie_config}"
  end
end
