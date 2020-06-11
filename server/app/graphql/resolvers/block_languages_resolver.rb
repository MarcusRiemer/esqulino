
module Resolvers
  class BlockLanguagesResolver < Resolvers::BaseResolver
    type Types::BlockLanguageType.connection_type
    description 'Lists BlockLanguages'

    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'BlockLanguageOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
      value 'grammar'
    end

    class BlockLanguageOrderType < Types::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, BaseResolver::OrderDirectionEnum, required: false
    end

    scope { Grammar.all }

    #Query arguments for filtering and ordering
    option :id, type: types.String, with: :apply_id_filter
    option :name, type: types.String, with: :apply_name_filter
    option :slug, type: types.String, with: :apply_slug_filter
    option :order, type: BlockLanguageOrderType, with: :apply_order

    def apply_id_filter(scope, value)
      scope.where id: value
    end

    def apply_name_filter(scope, value)
      scope.where 'name LIKE ?', escape_search_term(value)
    end

    def apply_slug_filter(scope, value)
      scope.where 'slug LIKE ?', escape_search_term(value)
    end

    def apply_order(scope,value)
      order_key = value.to_h.stringify_keys.fetch("orderField","name")
      order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
      scope.order "#{order_key} #{order_dir}"
    end
  end
end
