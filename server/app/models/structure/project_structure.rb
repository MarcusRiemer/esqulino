module Structure
  class ProjectStructure

    API_VERSION = 4

    def initialize(project:)
      @project = project
    end
    
    def build
      data['schema'] = schema
      data['apiVersion'] = api_version
      data['queries'] = queries
      data['pages'] = pages
      data['sources'] = sources
      data
    end

    # TODO construct sqlite path with project slug and pass it to here: database_describe_schema(sqlite_file_path)
    def schema
      []
    end
 
    def api_version
      API_VERSION
    end

    def queries
      []
    end

    def pages
      []
    end

    def project
      raise StandardError, 'Project data has to be fetched first' if @project.blank?

      @project
    end
    
    def sources
      project.project_sources
    end

    def data
      @data ||= project.serializable_hash
    end
  end
end