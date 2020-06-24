class Mutations::Grammar::GrammarMutation < Mutations::BaseMutation

  field :grammar, Types::GrammarType, null: true
  field :errors, [String], null: false

  def save_grammar(grammar)
    if grammar.save
      {
          grammar: grammar,
          errors: []
      }
    else
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


