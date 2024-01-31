require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Server
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

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
  end
end
