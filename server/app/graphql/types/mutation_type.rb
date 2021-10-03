module Types
  class MutationType < Types::Base::BaseObject
    field :create_grammar, mutation: Mutations::Grammar::CreateGrammar
    field :update_grammar, mutation: Mutations::Grammar::UpdateGrammar
    field :destroy_grammar, mutation: Mutations::Grammar::DestroyGrammar
    field :regenerate_foreign_types, mutation: Mutations::Grammar::RegenerateForeignTypes

    field :create_block_language, mutation: Mutations::BlockLanguage::CreateBlockLanguage
    field :update_block_language, mutation: Mutations::BlockLanguage::UpdateBlockLanguage
    field :destroy_block_language, mutation: Mutations::BlockLanguage::DestroyBlockLanguage
    field :store_block_language_seed, mutation: Mutations::SeedData::StoreBlockLanguage

    field :create_news, mutation: Mutations::News::CreateNews
    field :update_news, mutation: Mutations::News::UpdateNews
    field :destroy_news, mutation: Mutations::News::DestroyNews

    field :create_assignment, mutation: Mutations::Projects::CreateAssignment
    field :update_assignment, mutation: Mutations::Projects::UpdateAssignment
    field :destroy_assignment, mutation: Mutations::Projects::DestroyAssignment

    field :create_assignment_submission_grade, mutation: Mutations::Projects::CreateAssignmentSubmissionGrade

    field :create_assignment_submitted_code_resource, mutation: Mutations::Projects::CreateAssignmentSubmittedCodeResource
    field :destroy_assignment_submitted_code_resource, mutation: Mutations::Projects::DestroyAssignmentSubmittedCodeResource

    field :create_project_course_participation, mutation: Mutations::Projects::CreateProjectCourseParticipation
    field :create_project_course_participations, mutation: Mutations::Projects::CreateProjectCourseParticipations
    field :destroy_project_course_participation, mutation: Mutations::Projects::DestroyProjectCourseParticipation

    field :join_course, mutation: Mutations::Projects::JoinCourse
    field :join_participant_group, mutation: Mutations::Projects::JoinParticipantGroup

    field :update_project_group_settings, mutation: Mutations::Projects::UpdateProjectGroupSettings

    field :create_assignment_required_code_resource, mutation: Mutations::Projects::CreateAssignmentRequiredCodeResource
    field :destroy_assignment_required_code_resource, mutation: Mutations::Projects::DestroyAssignmentRequiredCodeResource
    field :update_assignment_required_code_resource, mutation: Mutations::Projects::UpdateAssignmentRequiredCodeResource

    field :create_assignment_required_solution, mutation: Mutations::Projects::CreateAssignmentRequiredSolution
    field :create_assignment_required_solution_from, mutation: Mutations::Projects::CreateAssignmentRequiredSolutionFrom
    field :remove_assignment_required_solution, mutation: Mutations::Projects::RemoveAssignmentRequiredSolution

    field :create_assignment_required_template, mutation: Mutations::Projects::CreateAssignmentRequiredTemplate
    field :create_assignment_required_template_from, mutation: Mutations::Projects::CreateAssignmentRequiredTemplateFrom

    field :create_assignment_submission, mutation: Mutations::Projects::CreateAssignmentSubmission
    field :create_assignment_submission_grade, mutation: Mutations::Projects::CreateAssignmentSubmissionGrade

    field :create_project, mutation: Mutations::Projects::CreateProject
    field :create_deep_copy_project, mutation: Mutations::Projects::CreateDeepCopyProject
    field :destroy_project, mutation: Mutations::Projects::DestroyProject
    field :update_project, mutation: Mutations::Projects::UpdateProject
    field :add_used_block_language, mutation: Mutations::Projects::AddUsedBlockLanguage
    field :add_member, mutation: Mutations::Projects::AddMembers
    field :change_member_role, mutation: Mutations::Projects::ChangeMemberRole
    field :change_owner, mutation: Mutations::Projects::ChangeOwner
    field :remove_member, mutation: Mutations::Projects::RemoveMember

    field :accept_invitation, mutation: Mutations::Projects::AcceptInvitation
    field :add_member_to_group, mutation: Mutations::Projects::AddMemberToGroup
    field :remove_member_from_participant_group, mutation: Mutations::Projects::RemoveMemberFromParticipantGroup

    field :remove_used_block_language, mutation: Mutations::Projects::RemoveUsedBlockLanguage
    field :create_programming_language, mutation: Mutations::CreateProgrammingLanguage
    field :store_project_seed, mutation: Mutations::SeedData::StoreProject

    field :create_code_resource, mutation: Mutations::CodeResource::Create
    field :update_code_resource, mutation: Mutations::CodeResource::Update

    field :promote_user_admin, mutation: Mutations::User::PromoteAdmin
  end
end
