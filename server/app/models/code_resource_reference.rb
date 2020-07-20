class CodeResourceReference < ApplicationRecord
  enum reference_type: {
         # A general reference without a specific meaning
         generic: 0
       }

  belongs_to :origin, :class_name => "CodeResource"
  belongs_to :target, :class_name => "CodeResource"
end
