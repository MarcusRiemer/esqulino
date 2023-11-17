module EsqulinoError
  # Something went wrong while executing a query
  class DatabaseQuery < Base
    # @param project [Project] The project the error occured in
    # @param sql [string] The faulty (?) query
    # @param params [Hash] The parameters that were used to run the query
    # @param impl_error [bool] True, if this is probably an error that
    #                          the developer is not responsible for.
    def initialize(project, sql, params, exception, impl_error)
      super("#{exception.class.name}: #{exception}", 400, impl_error)
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
