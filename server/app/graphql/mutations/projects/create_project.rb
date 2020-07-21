
class Mutations::Projects::CreateProject < Mutations::Projects::Projects

  argument :name, Types::Scalar::LangJson, required:true
  argument :slug, String, required:true

  def resolve(**args)
    project = Project.new(
        name:args[:name],
        slug:args[:slug],
        user_id:context[:current_user].id)
    if project.save
      {
          id: project.id,
          errors: []
      }
    else
      {
          id: nil,
          errors: project.errors.full_messages
      }
    end
  end
end


