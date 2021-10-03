class Mutations::Projects::CreateAssignmentSubmittedCodeResource < Mutations::BaseMutation
  argument :group_id, ID, required: true
  argument :required_code_resource_id, ID, required: true
  argument :block_language_id, ID, required: false

  field :project, Types::ProjectType, null: true

  def resolve(group_id:, required_code_resource_id:, block_language_id: nil)
    required_code_resource = AssignmentRequiredCodeResource.find(required_code_resource_id)

    assignment = required_code_resource.assignment

    course_project = Project.find_by_slug_or_id!(assignment.project.id)

    group = Project.find_by_slug_or_id!(group_id)

    raise Pundit::NotAuthorizedError if group.based_on_project != course_project

    authorize group, :create_assignment_submitted_code_resource?

    ActiveRecord::Base.transaction do
      # Submission ist already present
      assignment_submission = if !group.assignment_submissions.any? { |submission| submission.assignment_id == assignment.id }
                                group.assignment_submissions.create(assignment_id: assignment.id)
                              else
                                group.assignment_submissions.find_by(assignment_id: assignment.id)
                              end

      # TODO: find_or_create_by

      raise ArgumentError, 'There is already a submission' if assignment_submission.assignment_submitted_code_resources.where(assignment_required_code_resource_id: required_code_resource.id).any?

      assignment_submitted = AssignmentSubmittedCodeResource.new(assignment_submission_id: assignment_submission.id, assignment_required_code_resource_id: required_code_resource.id)

      if required_code_resource.is_template
        if required_code_resource.template.create_copy?
          code_resource = Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_one_code_resource(group, required_code_resource.template.code_resource)
          assignment_submitted.code_resource = code_resource
        else
          # reference
          assignment_submitted.code_resource = required_code_resource.template.code_resource
        end

      else
        # TODO: Die prüfung habe ich schon mal verwendet

        raise ArgumentError, 'Cannot create a submitted code resource without block language if it is not a template' if !block_language_id.present?
        raise ArgumentError, 'The programming_language is not supported by the block_language' if BlockLanguage.find(block_language_id).default_programming_language.id != required_code_resource.programming_language.id

        code_resource = CodeResource.create(name: required_code_resource.name, project: group, programming_language_id: required_code_resource.programming_language_id, block_language_id: block_language_id)
        code_resource.save!
        assignment_submitted.code_resource = code_resource
        # TODO: Woher weiß ich was für weitere Attribute die Code Resource besitzt. Eventuell immer eine Code Resource vorgeben ?

      end
      assignment_submitted.save!
    end

    {
      project: course_project
    }
  end
end
