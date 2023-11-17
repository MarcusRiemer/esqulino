# frozen_string_literal: true

module EsqulinoError
  # A query is too big to be executed properly
  class DatabaseResultTooLarge < Base
    # @param project [Project] The project the error occured in
    # @param sql [string] The faulty (?) query
    # @param params [Hash] The parameters that were used to run the query
    def initialize(project, sql, params)
      super('Query result set too large', 400, false)
      @project = project
      @sql = sql
      @params = params
    end

    def json_data
      {
        'project' => @project.id,
        'sql' => @sql,
        'params' => @params
      }
    end
  end
end
