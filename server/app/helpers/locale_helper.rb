# Utility methods to pick the correct locale
module LocaleHelper
  # Determines the locale of a request. If no locale can be determined,
  # it falls back to the default locale.
  def request_locale
    if not request.subdomain.blank?
      request.subdomain
    else
      "de"
    end
  end
end