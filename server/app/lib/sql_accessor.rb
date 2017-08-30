# Allows access to certain logical parts of an SQL query
module SqlAccessor

  # Guesses the name of the first table that has been mentioned
  # in a FROM component
  def self.first_from_tablename(sql)
    /FROM\s(\w+)/.match(sql)[1]
  end

  # Guesses the name of the only table that has been mentioned in
  # an INSERT INTO component
  def self.insert_tablename(sql)
    /INSERT\sINTO\s(\w+)/.match(sql)[1]
  end

  def self.where_whole(sql)
    /\sWHERE\s(.*)(GROUP BY|HAVING|ORDER BY)?/.match(sql)[1]
  end
end
