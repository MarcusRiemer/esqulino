module Types
  class BaseUnion < GraphQL::Schema::Union
  end

  class ProvidedLanguages < BaseUnion
    description "Objects which may be commented on"
    possible_types "de", "en"
  end

end
