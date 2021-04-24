class Resolvers::GrammarsResolver < Resolvers::BaseResolver
  attr_reader(:scope)

  def initialize(context: nil, filter: nil, order: nil, languages: nil)
    scope = Grammar

    super(Grammar, context: context, scope: scope, filter: filter, order: order, languages: languages, order_dir: "asc", order_field: "name")
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
