
module Resolvers
  class NewsResolver
    #scope { Grammar.all }

    #Query arguments for filtering and ordering
    #option :id, type: types.String, with: :apply_id_filter
    #option :title, type: types.String, with: :apply_title_filter
    # option :order, type: NewsOrderType, with: :apply_order

    # TODO: Filter for published_from, created_at and updated_at ?

    # def apply_id_filter(scope, value)
    #  scope.where id: value
    #end

    #def apply_title_filter(scope, value)
    #  scope.where \'title LIKE ?\', escape_search_term(value)
    #end

    #def apply_order(scope,value)
    #  order_key = value.to_h.stringify_keys.fetch("orderField","title")
    #  order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
    #  scope.order "#{order_key} #{order_dir}"
    #end"
  end
end

