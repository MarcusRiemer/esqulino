module Types
  class QueryType < GraphQL::Schema::Object

    field :programmingLanguages, Types::ProgrammingLanguageType.connection_type, null: false

    field :blockLanguages, Types::BlockLanguageType.connection_type, null: false do
      argument :input, Types::BlockLanguageType::InputType,required:false
    end
    field :singleBlockLanguage, Types::BlockLanguageDescriptionType, null:false do
      argument :id, ID,required:true
    end

    field :grammars, Types::GrammarType.connection_type, null: false do
      argument :input, Types::GrammarType::InputType, required: false
    end
    field :singleGrammar, Types::GrammarType, null: false do
      argument :id, ID,required:true
    end

    field :codeResources, Types::CodeResourceType.connection_type,null:false do
      argument :input, Types::CodeResourceType::InputType, required: false
    end
    field :news, Types::NewsType.connection_type,null:false do
      argument :input, Types::NewsType::InputType, required: false
    end
    field :adminSingleNews, Types::NewsType,null:false do
      argument :id, ID,required:true
    end
    field :frontpageSingleNews, Types::NewsType,null:false do
      argument :id, ID,required:true
    end
    field :frontpageListNews, Types::NewsType.connection_type,null:false do
      argument :input, Types::NewsType::AdvancedInputType, required: false
    end
    field :projectDatabases, Types::ProjectDatabaseType.connection_type,null:false
    field :projectSources, Types::ProjectSourceType.connection_type,null:false
    field :projects, Types::ProjectType.connection_type, null: false do
      argument :input, Types::ProjectType::InputType, required: false
    end
    field :singleProject, Types::ProjectType,null:false do
      argument :id, ID,required:true
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

    def single_block_language(id:)
      begin
        block_lang = if BlattwerkzeugUtil::string_is_uuid? id then
                       BlockLanguage.find id
                     else
                       BlockLanguage.find_by! slug: id
                     end
        block_lang.to_full_api_response.transform_keys {|a| a.underscore}
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("BlockLangugae with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end

    def code_resources(input:nil)
      if input
        Resolvers::CodeResourceResolver::new(context:@context,**input).scope
      else
        Resolvers::CodeResourceResolver::new(context:@context).scope
      end
    end

    def admin_single_news(id:)
      begin
      News.find(id).to_full_api_response.transform_keys {|a| a.underscore}
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
          .transform_keys {|a| a.underscore}
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("News with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
      end
    end

    def frontpage_list_news(input:nil)
      input = input.to_h.merge({languages:[context[:language]]}) if input[:languages].nil?
      news = if input
               Resolvers::NewsResolver::new(context:@context,**input.to_h.except(:text_length)).scope
             else
               Resolvers::NewsResolver::new(context:@context).scope
             end
      news.each { |n| n['text'] = n.rendered_text(text_length: input[:text_length].to_sym)}
    end

    def news(input:nil)
      if input
        Resolvers::NewsResolver::new(context:@context,**input).scope
      else
        Resolvers::NewsResolver::new(context:@context).scope
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

    def projects(input:nil)
      if input
        Resolvers::ProjectsResolver::new(context:@context,**input).scope
      else
        Resolvers::ProjectsResolver::new(context:@context).scope
      end
    end

    def single_grammar(id:)
      begin
        a = if BlattwerkzeugUtil::string_is_uuid? id
              Grammar.find(id)
            else
              Grammar.find_by! slug: id
            end
        a.root = 1
        return a
      rescue ActiveRecord::RecordNotFound
        raise GraphQL::ExecutionError.new("Grammar with 'id'=#{id} could not be found", extensions: { code: 'NOT_FOUND' })
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
