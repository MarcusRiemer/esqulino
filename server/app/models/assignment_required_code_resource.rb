class AssignmentRequiredCodeResource < ApplicationRecord
    # Assignment that needs this code resource type 
    belongs_to :assignment

    belongs_to :programming_language

    # Proposed solutions of the students
    has_many :assignment_submitted_code_resources

    # Solution of the request
    belongs_to :solution, class_name: 'CodeResource',  :foreign_key => 'code_resource_id', optional: true

    # A request can contain given code snippets or a whole specification 
    has_one :template, class_name: 'AssignmentTemplateCodeResource',  :foreign_key => 'assignment_required_code_resource_id', :dependent => :destroy

    validates :name, presence: true

    # The associated block language must be permitted by the parent project.
    # If the project does not reference the block language that this resource
    # is referencing the reference is not allowed.
    validate do 
        if (self.programming_language and self.assignment.project) and not self.assignment.project.block_languages.any? {|block| block.default_programming_language == self.programming_language}  then
            errors.add(:programming_language, "not allowed by project")
        end
    end


    def is_template()
        template.present?
    end
end
