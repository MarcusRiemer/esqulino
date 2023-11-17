# frozen_string_literal: true

class ProjectMailer < ApplicationMailer
  # A new project was created, the admin should know
  def created_admin
    @locale = locale
    @project_id = @params[:project].id
    @project_name = LocaleHelper.first_matching_text(@params[:project].name, [@locale])
    @project_visitor_url = "http://#{@project_id}.#{project_site_url}"
    @project_editor_url = "http://#{project_editor_url}/editor/#{@project_id}"

    mail(to: admin_mail, subject: "New Project: #{@project_name} (#{@project_id})")
  end
end
