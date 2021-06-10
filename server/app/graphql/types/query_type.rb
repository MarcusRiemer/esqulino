module Types
  class QueryType < GraphQL::Schema::Object
    # Endpoint for programming languages
    field :programming_languages, Types::ProgrammingLanguageType.connection_type, null: false
    def programming_languages
      ProgrammingLanguage.all
    end

    # LEGACY Endpoint for paginated projects
    field :legacy_projects, Types::ProjectType.connection_type, null: false do
      argument :input, Types::ProjectType::InputType, required: false
    end
    def legacy_projects(input: {})
      Resolvers::ProjectsResolver.connection(input, @context)
    end

    # RESOLVER Endpoint for paginated projects
    field :projects,
          Types::ProjectType.connection_type,
          null: false,
          resolver: Resolvers::ProjectsResolver::List do
      argument :input, Types::ProjectType::InputType, required: false
    end

    # LEGACY Endpoint for single project
    field :legacy_project, Types::ProjectType, null: false do
      argument :id, ID, required: true
    end
    def legacy_project(id:)
      Resolvers::ProjectsResolver.single(id, @context)
    end

    # RESOLVER Endpoint for single project
    field :project,
          Types::ProjectType,
          null: false,
          resolver: Resolvers::ProjectsResolver::Single do
      argument :id, ID, required: true
    end

    # Endpoint for paginated block languages
    field :block_languages, Types::BlockLanguageType.connection_type, null: false do
      argument :input, Types::BlockLanguageType::InputType, required: false
    end
    def block_languages(input: {})
      Resolvers::BlockLanguageResolver.connection(input, @context)
    end

    # Endpoint for single block language
    field :block_language, Types::BlockLanguageType, null: false do
      argument :id, ID, required: true
    end
    def block_language(id:)
      Resolvers::BlockLanguageResolver.single(id, @context)
    end

    # Endpoint for paginated grammars
    field :grammars, Types::GrammarType.connection_type, null: false do
      argument :input, Types::GrammarType::InputType, required: false
    end
    def grammars(input: {})
      Resolvers::GrammarsResolver.connection(input, @context)
    end

    # Endpoint for single grammar
    field :grammar, Types::GrammarType, null: false do
      argument :id, ID, required: true
    end
    def grammar(id:)
      Resolvers::GrammarsResolver.single(id, @context)
    end

    # Endpoint for code resources
    field :code_resources, Types::CodeResourceType.connection_type, null: false do
      argument :input, Types::CodeResourceType::InputType, required: false
    end
    def code_resources(input: {})
      Resolvers::CodeResourceResolver::new(context: @context, **input).scope
    end

    # Endpoint for news
    field :news, Types::NewsType.connection_type, null: false do
      argument :input, Types::NewsType::InputType, required: false
    end
    def news(input: {})
      Resolvers::NewsResolver::new(context: @context, **input).scope
    end

    # Endpoint for Users
    field :users, Types::UserType.connection_type, null: false do
      argument :input, Types::UserType::InputType, required: false
    end
    def users(input: {})
      Resolvers::UsersResolver::new(context: @context, **input).scope
    end

    # Endpoint for authorisation requests
    field :may_perform, Types::MayPerformType, null: false do
      argument :input, Types::MayPerformType::InputType, required: true
    end
    def may_perform(input: )
      Resolvers::MayPerform.check(@context, input)
    end

    # Related Block Languages are implemented immediatly here
    field :related_block_languages, [Types::BlockLanguageType], null: false do
      argument :grammarId, ID, required: true
    end
    def related_block_languages(grammarId:)
      BlockLanguage.scope_list
                   .where(grammar_id: grammarId)
                   .map { |b| b.to_list_api_response(options: { include_list_calculations: false })}
    end

    field :login_providers, [Types::LoginProviderType], null: false
    def login_providers
      Identity::Identity.all_client_information
        .map { |i| i.transform_keys { |k| k.to_s.camelize(:lower) } }
    end
  end
end
