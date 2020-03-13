module Types
  class QueryType < Types::BaseObject
    field :programmingLanguages, [Types::ProgrammingLanguageType], null: false
    field :blockLanguages, [Types::BlockLanguageType], null: false
    field :grammars, [Types::GrammarType],null:false

    def programming_languages
      ProgrammingLanguage.all
    end

    def block_languages
      BlockLanguage.all
    end

    def grammars
      Grammar.all
    end
  end
end
