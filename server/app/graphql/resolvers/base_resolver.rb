require 'search_object'
require 'search_object/plugin/graphql'

module Resolvers
  class BaseResolver
    include SearchObject.module(:graphql)

    class OrderDirectionEnum < Types::BaseEnum
      graphql_name 'OrderDirectionEnum'
      #Order Fields
      value 'asc'
      value 'desc'
    end

    def escape_search_term(term)
      "%#{term.gsub(/\s+/, '%')}%"
    end
  end
end