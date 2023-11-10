class Resolvers::UsersResolver < Resolvers::BaseQueryBuilder
  attr_reader(:scope)

  def initialize(context: nil, filter: nil, order: nil, languages: nil)
    scope = User

    super(User, context:, scope:, filter:, order:, languages:, order_dir: 'asc', order_field: 'display_name')
  end

  def self.connection(input = {}, context = nil)
    new(context:, **input).scope
  end

  def self.single(id, context = nil)
    new(context:, filter: { id: })
      .scope
      .first
  end
end
