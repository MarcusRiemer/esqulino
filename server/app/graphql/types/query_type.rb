module Types
  class QueryType < GraphQL::Schema::Object

    field :programmingLanguages, Types::ProgrammingLanguageType.connection_type, null: false
    field :blockLanguages, Types::BlockLanguageType.connection_type, null: false do
      argument :input, Types::BlockLanguageType::InputType,required:false
    end
    field :grammars, Types::GrammarType.connection_type, null: false do
      argument :input, Types::GrammarType::InputType, required: false
    end
    field :codeResources, Types::CodeResourceType.connection_type,null:false
    field :news, Types::NewsType.connection_type,null:false
    field :projectDatabases, Types::ProjectDatabaseType.connection_type,null:false
    field :projectSources, Types::ProjectSourceType.connection_type,null:false
    field :projects, Types::ProjectType.connection_type, null: false do
      argument :input, Types::ProjectType::InputType, required: false
    end

    def programming_languages
      ProgrammingLanguage.all
    end

    def block_languages(input:nil)
      if input
        Resolvers::BlockLanguageResolver::new(context:@context,**input).scope
      else
        Resolvers::BlockLanguageResolver::new(context:@context).scope
      end
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

    def projects(input:nil)
      if input
        Resolvers::ProjectsResolver::new(context:@context,**input).scope
      else
        Resolvers::ProjectsResolver::new(context:@context).scope
      end
    end

    def grammars(input:nil)
      if input
        Resolvers::GrammarsResolver::new(**input).scope
      else
        Resolvers::GrammarsResolver::new.scope
      end
    end
  end
end
