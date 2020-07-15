
module Types
  class Types::BlockLanguageDescriptionType < Types::Base::BaseObject
    # This type is needed to match with client side BlockLanguageDescription
    field :id, ID, null:false
    field :name, String, null:false
    field :sidebars, GraphQL::Types::JSON, null:false
    field :editorBlocks, GraphQL::Types::JSON, null:false
    field :editorComponents, GraphQL::Types::JSON, null:false
    field :rootCssClasses, GraphQL::Types::JSON, null:true
    field :localGeneratorInstructions, GraphQL::Types::JSON, null:true
    field :slug, String, null:true
    field :defaultProgrammingLanguage, Types::ProgrammingLanguageType,null:false
    field :defaultProgrammingLanguageId, ID,null:false
    field :grammar, Types::GrammarType, null:true
    field :grammarId, ID, null: true
    field :generated, Boolean, null:true
    field :codeResources, [Types::CodeResourceType], null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:true
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:true

    def sidebars
      normalize_keys(object)["sidebars"]
    end

    def grammar_id
      normalize_keys(object)["grammar_id"]
    end

    def editor_blocks
      normalize_keys(object)["editor_blocks"]
    end

    def editor_components
      normalize_keys(object)["editor_components"]
    end

    def default_programming_language_id
      normalize_keys(object)["default_programming_language_id"]
    end

    def root_css_classes
      normalize_keys(object)["root_css_classes"]
    end

    def local_generator_instructions
      normalize_keys(object)["local_generator_instructions"]
    end
  end
end
