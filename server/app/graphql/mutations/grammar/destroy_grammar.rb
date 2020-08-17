class Mutations::Grammar::DestroyGrammar < Mutations::Grammar::Grammar

  argument :id, ID, required: true

  def resolve(id:)
    begin
    grammar = Grammar.find(id)
    destroy_grammar(grammar)
    rescue ActiveRecord::RecordNotFound
      {
          news: nil,
          errors: ["Couldn't find Grammar with 'id'=\"#{id}\""]
      }
    end
  end
end



