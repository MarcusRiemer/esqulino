class GraphqlQueryStorage
  attr_reader :queries

  # Loads all queries from the given directory
  #
  # @param query_dir [string] A path containing graphql query and mutation files
  def initialize(query_dir)
    @queries = {}
    @query_dir = File.realdirpath(query_dir)

    Dir.glob(@query_dir + "/*.graphql").each do |query_file|
      query_name = File.basename(query_file, ".graphql")

      query_content = File.read(query_file)

      @queries[query_name] = query_content
    end
  end

  # Retrieves a query by its name
  #
  # @param query_name [string] The name of the query
  def get_query(query_name)
    # Ensuring the query exists
    query = @queries[query_name]
    if query == nil
      raise ArgumentError, "Could not find unknown query \"#{query_name}\""
    end

    query
  end

  def exists?(query_name:)
    not @queries[query_name].nil?
  end

  # @return [string] Path for a query with the given name
  def query_path(name)
    File.join(@query_dir, name + ".json")
  end
end
