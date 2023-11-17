# frozen_string_literal: true

class GraphqlQueryStorage
  attr_reader :queries

  # Loads all queries from the given directory
  #
  # @param query_dir [string] A path containing graphql query and mutation files
  def initialize(query_dir)
    @queries = {}
    @query_dir = File.realdirpath(query_dir)

    # All files that promise to be queries
    query_files = Dir.glob("#{@query_dir}/*.graphql").to_set

    query_files.each do |query_file|
      query_name = File.basename(query_file, '.graphql')
      query_content = File.read(query_file)

      @queries[query_name] = query_content
    end

    # Warn about files that don't seem to be queries
    all_files = Dir.glob("#{@query_dir}/*").to_set
    unknown_files = all_files - query_files

    return if unknown_files.empty?

    Rails.logger.warn "There are unknown files in the query directory: #{unknown_files.to_a.join}"
  end

  # Retrieves a query by its name
  #
  # @param query_name [string] The name of the query
  def get_query(query_name)
    # Ensuring the query exists
    query = @queries[query_name]
    raise ArgumentError, "Could not find unknown query \"#{query_name}\"" if query.nil?

    query
  end

  def exists?(query_name:)
    !@queries[query_name].nil?
  end

  # @return [string] Path for a query with the given name
  def query_path(name)
    File.join(@query_dir, "#{name}.json")
  end
end
