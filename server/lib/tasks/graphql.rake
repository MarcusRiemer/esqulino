require "graphql/rake_task"
GraphQL::RakeTask.new(
    load_schema: ->(_task) {
      require File.expand_path("../../app/graphql/server_schema", __dir__)
      ServerSchema
    },
    directory: File.expand_path("../../../schema/graphql", __dir__)
)