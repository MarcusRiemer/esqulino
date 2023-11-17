class ApplicationMailer < ActionMailer::Base
  default from: Rails.configuration.sqlino[:mail][:default_sender]
  layout 'mailer'

  def admin_mail
    Rails.configuration.sqlino[:mail][:admin]
  end

  def project_editor_url
    Rails.configuration.sqlino[:editor_domain]
  end

  def project_site_url
    Rails.configuration.sqlino[:project_domains][0]
  end

  # The locale that is used to send the mail
  def locale
    'en'
  end
end
