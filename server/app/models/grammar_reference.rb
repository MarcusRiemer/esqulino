# A reference from one grammar to the next. Because the terms
# "origin" and "target" are somewhat confusing, you can think
# of them as "lhs" (left hand side) and "rhs" (right hand side).
#
# - <lhs> visualizes <rhs>
# - <lhs> includes types of <rhs>
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
