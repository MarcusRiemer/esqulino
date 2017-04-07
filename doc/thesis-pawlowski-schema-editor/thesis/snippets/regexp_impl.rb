db.create_function('regexp', 2) do |func, pattern, expression|
    unless expression.nil?
      func.result = expression.to_s.match(
        Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
    else
      # Return true if the value is null, let the DB handle this
      func.result = 1
    end   
  end