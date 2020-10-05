class GrammarReference < ApplicationRecord
  enum reference_type: {
    # Pull all the types from the target grammar
    # into the origin grammar
    include_types: 0,
    # Strictly visualize the target grammar
    visualize: 1
  }

  belongs_to :origin, :class_name => "Grammar"
  belongs_to :target, :class_name => "Grammar"
end
