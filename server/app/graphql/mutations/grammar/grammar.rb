class Mutations::Grammar::Grammar < Mutations::BaseMutation
  include JsonSchemaHelper

  field :grammar, Types::GrammarType, null: true
  field :errors, [String], null: false

  def save_grammar(grammar)
    begin
      grammar.save!
      {
        grammar: grammar,
        errors: []
      }
    rescue ActiveRecord::InvalidForeignKey, ActiveRecord::RecordInvalid
      {
        grammar: nil,
        errors: grammar.errors.full_messages
      }
    end
  end

  def destroy_grammar(grammar)
    begin
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
end
