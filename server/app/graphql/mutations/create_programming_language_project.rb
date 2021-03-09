class Mutations::CreateProgrammingLanguageProject < Mutations::BaseMutation
  argument :project_name, String, required: true
  argument :language_name, String, required: true
  argument :description, String, required: true

  field :id, ID, null: true
end
