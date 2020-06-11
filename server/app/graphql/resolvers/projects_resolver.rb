module Resolvers
  class ProjectsResolver < Resolvers::BaseResolver
    type Types::ProjectType.connection_type
    description 'Lists projects'

    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'ProjectOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
    end

    class ProjectOrderType < Types::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, BaseResolver::OrderDirectionEnum, required: false
    end

    class ProjectFilterFieldType < Types::BaseInputObject
      argument :id, type: String, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :public, type: Boolean, required: false
    end

    scope { Project.full }

    #Query arguments for filtering and ordering
    option :filter, type: ProjectFilterFieldType, with: :apply_filter
    option :order, type: ProjectOrderType, with: :apply_order

    def apply_filter(scope, value)
      @projects = scope
      value.to_h.each do |filter_key,filter_value|
        byebug
        @projects = @projects.where "#{filter_key} LIKE ?", escape_search_term(filter_value)
      end
      scope.where id: value
    end

    def apply_order(scope,value)
      order_key = value.to_h.stringify_keys.fetch("orderField","name")
      order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
      scope.order "#{order_key} #{order_dir}"
    end
  end
end