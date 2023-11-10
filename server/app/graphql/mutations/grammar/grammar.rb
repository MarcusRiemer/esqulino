class Mutations::Grammar::Grammar < Mutations::BaseMutation
  include JsonSchemaHelper

  field :grammar, Types::GrammarType, null: true
  field :errors, [String], null: false

  def save_grammar(grammar)
    grammar.save!
    {
      grammar:,
      errors: []
    }
  rescue ActiveRecord::InvalidForeignKey, ActiveRecord::RecordInvalid
    {
      grammar: nil,
      errors: grammar.errors.full_messages
    }
  end

  def destroy_grammar(grammar)
    grammar.destroy!
    {
      grammar: nil,
      errors: []
    }
  rescue ActiveRecord::InvalidForeignKey
    {
      grammar: nil,
      errors: ['EXISTING_REFERENCES']
    }
  end
end
