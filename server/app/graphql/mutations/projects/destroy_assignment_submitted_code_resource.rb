class Mutations::Projects::DestroyAssignmentSubmittedCodeResource < Mutations::BaseMutation
  argument :assignment_submitted_code_resource_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(assignment_submitted_code_resource_id:)
    assignment_submitted_code_resource = AssignmentSubmittedCodeResource.find(assignment_submitted_code_resource_id)

    submission = assignment_submitted_code_resource.assignment_submission

    group = Project.find_by_slug_or_id!(submission.project.id)

    raise Pundit::NotAuthorizedError if !submission.assignment.end_date.nil? && (submission.assignment.end_date <= Date.today)

    authorize group, :destroy_assignment_submitted_code_resource?

    code_resource = assignment_submitted_code_resource.code_resource

    ActiveRecord::Base.transaction do
      assignment_submitted_code_resource.destroy!

      code_resource.destroy! unless assignment_submitted_code_resource.assignment_required_code_resource.is_template && !assignment_submitted_code_resource.assignment_required_code_resource.template.create_copy?
    end

    {
      project: group
    }
  end
end
