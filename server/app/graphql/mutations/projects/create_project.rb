
class Mutations::Projects::CreateProject < Mutations::Projects::Projects

  argument :name, Types::Scalar::LangJson, required:true
  argument :slug, String, required:false

  def resolve(**args)
    project = Project.new(
        name:args[:name],
        slug:args[:slug],
        user_id:context[:user].id)
    save_project(project)
  end
end


