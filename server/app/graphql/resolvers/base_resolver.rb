
module Resolvers
  class BaseResolver

    def escape_search_term(term)
      "%#{term.gsub(/\s+/, '%')}%"
    end



    def to_single_quotes_array(arr)
      arr.to_s.gsub(/["]/,'\'')
    end
  end
end