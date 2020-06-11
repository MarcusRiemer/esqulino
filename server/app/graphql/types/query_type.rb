module Types
  class QueryType < GraphQL::Schema::Object

    field :programmingLanguages, Types::ProgrammingLanguageType.connection_type, null: false
    field :blockLanguages, Types::BlockLanguageType.connection_type, null: false
    field :grammars, resolver: Resolvers::GrammarsResolver
    field :codeResources, Types::CodeResourceType.connection_type,null:false
    field :news, Types::NewsType.connection_type,null:false
    field :projectDatabases, Types::ProjectDatabaseType.connection_type,null:false
    field :projectSources, Types::ProjectSourceType.connection_type,null:false
    field :projects, resolver: Resolvers::ProjectsResolver

    def programming_languages
      ProgrammingLanguage.all
    end

    def block_languages
      BlockLanguage.all
    end

    def code_resources
      CodeResource.all
    end

    def news
      News.all
    end

    def project_databases
      ProjectDatabase.all
    end

    def project_sources
      ProjectSource.all
    end


  end
end
