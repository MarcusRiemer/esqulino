# Utility methods to pick the correct locale
module LocaleHelper
  # The languages that BlattWerkzeug supports
  def self.allowed_languages
    Types::Base::BaseEnum::LanguageEnum.values.keys
  end

  # Determines the locale of a request. If no locale can be determined,
  # it falls back to the default locale.
  def request_locale
    if not request.subdomain.blank?
      # For whatever reason RSpec (or Rails) runs all tests with a www-subdomain
      # that does not seem to be configurable. In the deployed version the web-
      # server should redirect all requests on the www subdomain, but it doesn't
      # hurt too much to handle this here as well.
      if request.subdomain == "www"
        return "de"
      else
        return request.subdomain
      end
    else
      return "de"
    end
  end
end
