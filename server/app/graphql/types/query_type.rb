module Types
  class QueryType < Types::BaseObject
    field :programmingLanguages, [Types::ProgrammingLanguageType], null: false
    field :blockLanguages, [Types::BlockLanguageType], null: false
    field :grammars, [Types::GrammarType],null:false
    field :codeResources, [Types::CodeResourceType],null:false
    field :news, [Types::NewsType],null:false
    field :projectDatabases, [Types::ProjectDatabaseType],null:false
    field :projectSources, [Types::ProjectSourceType],null:false
    field :projects, [Types::ProjectType],null:false do
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
        Project.all
      end
    end

  end
end
