module Types
  class QueryType < GraphQL::Schema::Object
    # Endpoint for programming languages
    field :programmingLanguages, Types::ProgrammingLanguageType.connection_type, null: false
    def programming_languages
      ProgrammingLanguage.all
    end

    # Endpoint for block languages
    field :blockLanguages, Types::BlockLanguageType.connection_type, null: false do
      argument :input, Types::BlockLanguageType::InputType, required: false
    end
    def block_languages(input: {})
      Resolvers::BlockLanguageResolver::new(context: @context, **input).scope
    end

    # Endpoint for grammars
    field :grammars, Types::GrammarType.connection_type, null: false do
      argument :input, Types::GrammarType::InputType, required: false
    end
    def grammars(input: {})
      Resolvers::GrammarsResolver::new(context: @context, **input).scope
    end

    # Endpoint for code resources
    field :codeResources, Types::CodeResourceType.connection_type, null: false do
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

    field :frontpageListNews, Types::NewsType.connection_type, null: false do
      argument :input, Types::NewsType::AdvancedInputType, required: false
    end

    def frontpage_list_news(input: {})
      input = input.to_h.merge({ languages: [context[:language]] }) if input[:languages].nil?
      news = Resolvers::NewsResolver::new(context: @context, **input.to_h.except(:text_length)).scope
      news.each { |n| n['text'] = n.rendered_text(text_length: input[:text_length].to_sym)}
    end

    # Endpoint for projects
    field :projects, Types::ProjectType.connection_type, null: false do
      argument :input, Types::ProjectType::InputType, required: false
    end
    def projects(input: {})
      Resolvers::ProjectsResolver::new(context: @context, **input).scope
    end

    field :singleBlockLanguage, Types::BlockLanguageType, null: false do
      argument :id, ID, required: true
    end
    field :singleGrammar, Types::GrammarType, null: false do
      argument :id, ID, required: true
    end
    field :adminSingleNews, Types::NewsType, null: false do
      argument :id, ID, required: true
    end
    field :frontpageSingleNews, Types::NewsType, null: false do
      argument :id, ID, required: true
    end

    field :projectDatabases, Types::ProjectDatabaseType.connection_type, null: false
    field :projectSources, Types::ProjectSourceType.connection_type, null: false

    field :singleProject, Types::ProjectType, null: false do
      argument :id, ID, required: true
    end

    field :relatedBlockLanguages, [Types::BlockLanguageType], null: false do
      argument :grammarId, ID, required: true
    end

    def related_block_languages(grammarId:)
      BlockLanguage.scope_list
                   .where(grammar_id: grammarId)
                   .map { |b| b.to_list_api_response(options: { include_list_calculations: false })}
    end

    def admin_single_news(id:)
      begin
        News.find(id).to_full_api_response.transform_keys { |a| a.underscore}
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("News with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end

    def frontpage_single_news(id:)
      begin
        News.scope_single_language(context[:language])
            .where("id = ?", id)
            .first!
            .to_frontpage_api_response(languages: [context[:language]])
            .transform_keys { |a| a.underscore}
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("News with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end

    def project_databases
      ProjectDatabase.all
    end

    def project_sources
      ProjectSource.all
    end

    def single_project(id:)
      begin
        if BlattwerkzeugUtil::string_is_uuid? id
          Project.full.find(id)
        else
          Project.full.find_by! slug: id
        end
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("Project with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end

    def single_grammar(id:)
      begin
        if BlattwerkzeugUtil::string_is_uuid? id
          Grammar.find(id)
        else
          Grammar.find_by! slug: id
        end
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("Grammar with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end
  end
end
