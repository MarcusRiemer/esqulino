class Assignment < ApplicationRecord
    # Each Assignment is assigned to a project 
    belongs_to :project

    # Possible solutions for the Assignment 
    has_many :assignment_submissions

    # Required file formats to successfully pass the Assignment
    has_many :assignment_required_code_resources, :dependent => :destroy

    validates :name, length: { in: 1..255, allow_nil: false }
    validates :weight, numericality: { only_integer: true, greater_than: 0 }

    def assert_is_delivery_date_exceeded!
        today = DateTime.current
        raise ArgumentError, 'The delivery period has been exceeded' if ((!end_date.nil? && (end_date <= today)) || (!start_date.nil? && (start_date >= today)) )
      end

end
