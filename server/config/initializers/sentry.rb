Rails.application.config.after_initialize do
  sentry_dsn = Rails.configuration.sqlino.dig('sentry', 'dsn')
  if sentry_dsn
    Raven.configure do |config|
      config.dsn = sentry_dsn
      config.release = `git rev-parse HEAD`.strip
    end
  end
end
