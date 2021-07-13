class Mutations::Projects::CreateDeepCopyProject < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :new_slug, String, required: false

    field :project, Types::ProjectType, null: true

    def resolve(project_id:, new_slug: nil)
      project = Project.find_by_slug_or_id! (project_id)

      authorize project, :create_deep_copy?

      if project.is_course()
        raise ArgumentError.new("Can´t create a deep copy of a course")
      end

    
    return createDeepCopy(project, new_slug)
    end 

    def createDeepCopy(project, new_slug)
      c_project = project.dup
      c_project.slug = new_slug.present? ? new_slug : nil

      ActiveRecord::Base.transaction do
        c_project.user = current_user
        c_project.save!
        Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_uses_block_languages(project, c_project)

       

        Mutations::Projects::CreateDeepCopyProject.helper_create_deep_copy_of_databases(project, c_project)

        project.project_sources.each do |v|
            project_source = v.dup
            project_source.project = c_project
            project_source.save!
        end

        project.code_resources.each do |v|
          Mutations::Projects::CreateDeepCopyProject.helper_create_deep_copy_of_code_resource(v, c_project)
        end
      end
      
      return ({
        project: c_project
      })
    end

    def self.helper_create_deep_copy_of_code_resource(code_resource, project)
      copied_code_resource = code_resource.dup
      copied_code_resource.project = project
      copied_code_resource.block_language = code_resource.block_language
      copied_code_resource.programming_language = code_resource.programming_language
      copied_code_resource.generated_grammars = code_resource.generated_grammars
      copied_code_resource.generated_block_languages = code_resource.generated_block_languages
      copied_code_resource.code_resource_reference_origins = code_resource.code_resource_reference_origins
      copied_code_resource.save!
    end

    def self.helper_create_deep_copy_of_databases(project, c_project)
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
    end


    def self.helper_create_copy_of_project_uses_block_languages(project, c_project)
      project.project_uses_block_languages.each do |v|
        project_uses_block_language = v.dup
          project_uses_block_language.project = c_project
          project_uses_block_language.save!
      end
    end




  end
  