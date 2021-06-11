class AssigmentCodeResource < ApplicationRecord
    belongs_to :assigment
    belongs_to :code_resource

# Represent the possible Resource Type of a code_ressource
  enum ressource_type: {
    solution: 0,
    world: 1,
    template: 2,
  }
end
