# frozen_string_literal: true

# Provides access to a globally available Validator instance
module GraphqlQueryHelper
  include UserHelper
  include LocaleHelper

  @@query_storage = GraphqlQueryStorage.new Rails.configuration.sqlino['query_dir']

  # Handle form data, JSON body, or a blank value
  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      if ambiguous_param.present?
        ensure_hash(JSON.parse(ambiguous_param))
      else
        {}
      end
    when Hash, ActionController::Parameters
      ambiguous_param
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end

  # Retrieves the query from the storage
  def get_query(name)
    query_insert_typename @@query_storage.get_query(name.underscore)
  end

  def exists?(name:)
    @@query_storage.exists?(query_name: name)
  end

  # Returns the path the given query would be found under
  def schema_path(name)
    @@query_storage.query_path(name)
  end

  # Takes an existing GraphQL query and ensures for all mentioned lists
  # of fields that they include a `__typename`.
  #
  # @param query_string [String] The GraphQL query
  # @return [String] The GraphQL query with possibly additional `__typename` fields
  def query_insert_typename(query_string)
    query = GraphQL.parse query_string

    visitor = Resolvers::InsertTypenameVisitor.new(query)
    visitor.visit

    # Add a trailing newline, this eases the specs because
    # we can work with heredocs to compare the result
    "#{visitor.result.to_query_string}\n"
  end
end
