class ProjectMailer < ApplicationMailer
  # A new project was created, the admin should know
  def created_admin
    @project = @params[:project]
    @project_visitor_url = "http://#{@project.id}.#{project_site_url}"
    @project_editor_url = "http://#{project_editor_url}/editor/#{@project.id}"

    mail(to: admin_mail, subject: "New Project: #{@project.name} (#{@project.id})")
  end
end
