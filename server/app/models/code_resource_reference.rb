class CodeResourceReference < ApplicationRecord
  belongs_to :origin, :class_name => "CodeResource"
  belongs_to :target, :class_name => "CodeResource"
end
