module PaginationHelper
      # Pagination for any query that will be displayed in a listing
  def pagination_response(model, query,options:{})

    order_key = list_params.stringify_keys.fetch("order_field", "name")
    order_dir = list_params.stringify_keys.fetch("order_direction", "asc")

    if (not model.has_attribute? order_key or not ["asc", "desc"].include? order_dir)
      raise EsqulinoError::InvalidOrder.new(order_key, order_dir)
    end

    paginated_query = query
              .order({ order_key => order_dir})
              .limit(list_params.fetch("limit", 100))
              .offset(list_params.fetch("offset", 0))

    return {
      data: paginated_query.map{|p| p.to_list_api_response(options:options)},
      meta: {
        # size() runs count() or length(), depending on if the collection has already been loaded or not.
        # count() will be executed if the collection hasn't been loaded yet 
        # length() will be executed if the collection already has been loaded
        # http://web.archive.org/web/20100210204319/http://blog.hasmanythrough.com/2008/2/27/count-length-size
        totalCount: query.size
      }
    }
  end

    # These attributes are used in all listings
    def list_params
        params.permit(:limit, :offset, :orderField, :orderDirection)
          .transform_keys { |k| k.underscore }
      end

end