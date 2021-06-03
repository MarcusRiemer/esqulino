class Mutations::Projects::CreateDeepCopyProject < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :new_slug, String, required: false

    field :project, Types::ProjectType, null: true

    def resolve(project_id:, new_slug:)
      project = Project.find_by_slug_or_id! (project_id)

      authorize project, :create_deep_copy?

    
    return createDeepCopy(project, new_slug)

    rescue ActiveRecord::RecordNotFound => e
      return (e)
    end 

    def createDeepCopy(project, new_slug)
      c_project = project.dup
      c_project.slug = new_slug.present? ? new_slug : nil

      ActiveRecord::Base.transaction do
        
        c_project.project_uses_block_languages = project.project_uses_block_languages

        c_project.user = current_user

        c_project.save!

        project.project_databases.each do |v|
            project_database = v.dup
                
            project_database.project = c_project
            project_database.save!

            #If the Project have a default database
            if(project.default_database == v)
                c_project.default_database = project_database
                c_project.save!
            end
        end

        project.project_sources.each do |v|
            project_source = v.dup
            project_source.project = c_project
            project_source.save!
        end

        project.code_resources.each do |v|
            code_resources = v.dup
            code_resources.project = c_project
            code_resources.block_language = v.block_language
            code_resources.programming_language = v.programming_language
            code_resources.generated_grammars = v.generated_grammars
            code_resources.generated_block_languages = v.generated_block_languages
            code_resources.code_resource_reference_origins = v.code_resource_reference_origins
            code_resources.save!
        end
      end
      
      return ({
        project: c_project
      })
    end
  end
  