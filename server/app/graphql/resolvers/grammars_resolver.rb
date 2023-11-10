class Resolvers::GrammarsResolver < Resolvers::BaseQueryBuilder
  attr_reader(:scope)

  def initialize(context: nil, filter: nil, order: nil, languages: nil)
    scope = Grammar

    super(Grammar, context:, scope:, filter:, order:, languages:, order_dir: 'asc', order_field: 'name')
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
