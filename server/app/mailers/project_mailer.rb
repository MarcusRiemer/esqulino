class ProjectMailer < ApplicationMailer
  # A new project was created, the admin should know
  def created_admin(project_id, project_name)
    @project_id = project_id
    @project_name = project_name
    @project_visitor_url = "http://#{project_id}.#{project_site_url}"
    @project_editor_url = "http://#{project_editor_url}/editor/#{project_id}"
    
    mail(to: admin_mail, subject: "New Project: #{project_name} (#{project_id})")
  end
end
