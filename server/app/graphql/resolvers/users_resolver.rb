class Resolvers::UsersResolver < Resolvers::BaseQueryBuilder
  attr_reader(:scope)

  def initialize(context: nil, filter: nil, order: nil, languages: nil)
    scope = User

    super(User, context: context, scope: scope, filter: filter, order: order, languages: languages, order_dir: "asc", order_field: "display_name")
  end

  def self.connection(input = {}, context = nil)
    new(context: context, **input).scope
  end

  def self.single(id, context = nil)
    new(context: context, filter: { id: id })
      .scope
      .first
  end
end
