module Types
  class QueryType < Types::BaseObject

    field :programmingLanguages, Types::ProgrammingLanguageType.connection_type, null: false
    field :blockLanguages, Types::BlockLanguageType.connection_type, null: false
    field :grammars, Types::GrammarType.connection_type,null:false
    field :codeResources, Types::CodeResourceType.connection_type,null:false
    field :news, Types::NewsType.connection_type,null:false
    field :projectDatabases, Types::ProjectDatabaseType.connection_type,null:false
    field :projectSources, Types::ProjectSourceType.connection_type,null:false
    field :projects, Types::ProjectType.connection_type,null:false do
      argument :public, Boolean, required:false
    end

    def programming_languages
      ProgrammingLanguage.all
    end

    def block_languages
      BlockLanguage.all
    end

    def grammars
      Grammar.all
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

    def projects(public: false)
      if public
        Project.where(public:true)
      else
        Project.full
      end
    end

  end
end
