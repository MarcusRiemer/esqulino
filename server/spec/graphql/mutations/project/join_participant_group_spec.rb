require 'rails_helper'

RSpec.describe Mutations::Projects::JoinParticipantGroup do
  # These specs relies on
  # * an existing guest user
  before(:each) do
    create(:user, :guest)
  end

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil
    }
  end

  it 'join participant group normal work' do
    course = create(:project, slug: 'course-test', max_group_size: 2,  selection_group_type: 'self_selection')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.first.user).to eq user
    expect(ProjectMember.first.project).to eq group
    expect(ProjectMember.first.membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2

    user2 = create(:user)

    mut = described_class.new(**init_args(user: user2))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user2.id).project).to eq group
    expect(ProjectMember.find_by(user_id: user2.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2

    user3 = create(:user)

    mut = described_class.new(**init_args(user: user3))
    res = mut.resolve(
      group_id: group2.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: user3.id).project).to eq group2
    expect(ProjectMember.find_by(user_id: user3.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'join participant group is already participant member' do
    course = create(:project, slug: 'course-test', max_group_size: 2,  selection_group_type: 'self_selection')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })
    user_participant2 = create(:user)
    group2.project_members.create(user_id: user_participant2.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: user_participant))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.first).to eq user_participant
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_participant.id).project).to eq group
    expect(ProjectMember.find_by(user_id: user_participant.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant2))
    res = mut.resolve(
      group_id: group2.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.first).to eq user_participant2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_participant2.id).project).to eq group2
    expect(ProjectMember.find_by(user_id: user_participant2.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant))
    res = mut.resolve(
      group_id: group2.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 0
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_participant.id).project).to eq group2
    expect(ProjectMember.find_by(user_id: user_participant.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: user_participant2))
    res = mut.resolve(
      group_id: group.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user_participant2.id).project).to eq group
    expect(ProjectMember.find_by(user_id: user_participant2.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'join participant group is member of root course' do
    course = create(:project, slug: 'course-test', max_group_size: 2, selection_group_type: 'self_selection')

    participant = create(:user)
    course.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    course.project_members.create(user_id: admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)
    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'join participant group is project_id' do
    project = create(:project, slug: 'test', max_group_size: 2, selection_group_type: 'self_selection')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'join participant group is course_id' do
    course = create(:project, slug: 'course-test', max_group_size: 2, selection_group_type: 'self_selection')
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'join participant group without max_group_size' do
    course = create(:project, slug: 'course-test', selection_group_type: 'self_selection')
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'join participant group with negativ max_group_size' do
    course = create(:project, slug: 'course-test', max_group_size: -2, selection_group_type: 'self_selection')
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 1
  end

  it 'join participant group is full' do
    course = create(:project, slug: 'course-test', max_group_size: 2, selection_group_type: 'self_selection')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group.project_members.create(user_id: admin.id, membership_type: 'admin')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'join participant group wrong selection_group_type' do
    course = create(:project, slug: 'course-test-2', max_group_size: 2, selection_group_type: 'fixed_number_of_groups')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 2

    course = create(:project, slug: 'course-test-3', max_group_size: 2, selection_group_type: 'as_many_groups_as_was_created')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 4

    course = create(:project, slug: 'course-test-4', max_group_size: 2)

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        group_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 9
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 6
  end

  it ' cant join participant group with submissions' do
    course = create(:project, slug: 'course-test', max_group_size: 2,  selection_group_type: 'self_selection')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    create(:assignment_submission, project: group)

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect{mut.resolve(
      group_id: group.id
    )}.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 0

  end

  it ' cant leave participant group with submissions' do
    course = create(:project, slug: 'course-test', max_group_size: 2,  selection_group_type: 'self_selection')


    participant = create(:user)
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    create(:assignment_submission, project: group)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')

    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })
    

    mut = described_class.new(**init_args(user: participant))
    expect{mut.resolve(
      group_id: group.id
    )}.to raise_error(ArgumentError)

    expect(ProjectMember.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 0
  end
end
