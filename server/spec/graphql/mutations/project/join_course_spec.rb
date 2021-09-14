require 'rails_helper'

RSpec.describe Mutations::Projects::JoinCourse do
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

  it 'join course normal work - fixed_number_of_groups' do
    course = create(:project, slug: 'course-test', max_group_size: 2, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.first.user).to eq user
    expect(ProjectMember.first.project).not_to eq course
    expect(ProjectMember.first.membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 1

    user2 = create(:user)

    mut = described_class.new(**init_args(user: user2))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user2.id).project).to eq Project.find_by(name: { 'de' => 'Gruppe-1' })
    expect(ProjectMember.find_by(user_id: user2.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 1

    user3 = create(:user)

    mut = described_class.new(**init_args(user: user3))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: user3.id).user).to eq user3
    expect(ProjectMember.find_by(user_id: user3.id).project).not_to eq Project.find_by(name: { 'de' => 'Gruppe-1' })
    expect(ProjectMember.find_by(user_id: user3.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'join course normal work - as_many_groups_as_was_created' do
    course = create(:project, slug: 'course-test', max_group_size: 2, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    user = create(:user)

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: user))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.first.user).to eq user
    expect(ProjectMember.first.project).not_to eq course
    expect(ProjectMember.first.membership_type).to eq 'participant'

    user2 = create(:user)

    mut = described_class.new(**init_args(user: user2))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user2.id).user).to eq user2
    expect(ProjectMember.find_by(user_id: user2.id).project).not_to eq course
    expect(ProjectMember.find_by(user_id: user2.id).membership_type).to eq 'participant'

    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })
    user3 = create(:user)

    mut = described_class.new(**init_args(user: user3))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: user3.id).user).to eq user3
    expect(ProjectMember.find_by(user_id: user3.id).project).not_to eq course
    expect(ProjectMember.find_by(user_id: user3.id).membership_type).to eq 'participant'
  end

  it 'join course normal work - no_group_number_limitation' do
    course = create(:project, slug: 'course-test', max_group_size: 2, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 1
    expect(ProjectMember.first.user).to eq user
    expect(ProjectMember.first.project).not_to eq course
    expect(ProjectMember.first.membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 1

    user2 = create(:user)

    mut = described_class.new(**init_args(user: user2))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 2
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).members.count).to eq 2
    expect(ProjectMember.count).to eq 2
    expect(ProjectMember.find_by(user_id: user2.id).user).to eq user2
    expect(ProjectMember.find_by(user_id: user2.id).project).not_to eq course
    expect(ProjectMember.find_by(user_id: user2.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 1

    user3 = create(:user)

    mut = described_class.new(**init_args(user: user3))
    res = mut.resolve(
      course_id: course.id
    )

    expect(Project.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).based_on_project).to eq course
    expect(Project.find_by(name: { 'de' => 'Gruppe-2' }).members.count).to eq 1
    expect(ProjectMember.count).to eq 3
    expect(ProjectMember.find_by(user_id: user3.id).user).to eq user3
    expect(ProjectMember.find_by(user_id: user3.id).project).not_to eq course
    expect(ProjectMember.find_by(user_id: user3.id).membership_type).to eq 'participant'
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'the course if full - fixed_number_of_groups' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group.project_members.create(user_id: user_participant.id, membership_type: 'participant')
    user_participant = create(:user)
    group.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 2
  end

  it 'the course if full - as_many_groups_as_was_created' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group.project_members.create(user_id: user_participant.id, membership_type: 'participant')
    user_participant = create(:user)
    group.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 2
  end

  # TODO: Marcus ist es okay, dass ic eine Pundit excpetion werfe, weil min Problem ist ja, dass es eig. keine Autorisierung ist, es aber einfach zum ändern macht
  it 'join course as owner of a participant group' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: user_participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 2

    course = create(:project, slug: 'course-test-2', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: user_participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 4

    course = create(:project, slug: 'course-test-3', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    user_participant = create(:user)
    group2.project_members.create(user_id: user_participant.id, membership_type: 'participant')

    mut = described_class.new(**init_args(user: user_participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 9
    expect(ProjectMember.count).to eq 3
    expect(ProjectCourseParticipation.count).to eq 6
  end

  it 'join course as member of the root course' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')
    course_participant = create(:user)
    course.project_members.create(user_id: course_participant.id, membership_type: 'participant')
    course_admin = create(:user)
    course.project_members.create(user_id: course_admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: course_participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: course_admin))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    course = create(:project, slug: 'course-test-2', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')
    course_participant = create(:user)
    course.project_members.create(user_id: course_participant.id, membership_type: 'participant')
    course_admin = create(:user)
    course.project_members.create(user_id: course_admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: course_participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 4

    mut = described_class.new(**init_args(user: course_admin))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 4

    course = create(:project, slug: 'course-test-3', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    course_participant = create(:user)
    course.project_members.create(user_id: course_participant.id, membership_type: 'participant')
    course_admin = create(:user)
    course.project_members.create(user_id: course_admin.id, membership_type: 'admin')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 9
    expect(ProjectMember.count).to eq 6
    expect(ProjectCourseParticipation.count).to eq 6
  end

  it 'join course as member of a course' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group2.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 2
    expect(ProjectCourseParticipation.count).to eq 2

    course = create(:project, slug: 'course-test-2', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group2.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 4

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 4

    course = create(:project, slug: 'course-test-3', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })
    group2 = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-2' })

    participant = create(:user)
    group.project_members.create(user_id: participant.id, membership_type: 'participant')
    admin = create(:user)
    group2.project_members.create(user_id: admin.id, membership_type: 'admin')

    mut = described_class.new(**init_args(user: participant))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 9
    expect(ProjectMember.count).to eq 6
    expect(ProjectCourseParticipation.count).to eq 6

    mut = described_class.new(**init_args(user: admin))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 9
    expect(ProjectMember.count).to eq 6
    expect(ProjectCourseParticipation.count).to eq 6
  end

  it 'join a project' do
    project = create(:project, slug: 'test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    project = create(:project, slug: 'test-2', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    project = create(:project, slug: 'test-3', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: project.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'join a participant group' do
    course = create(:project, slug: 'course-test', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'fixed_number_of_groups')

    user = create(:user)
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 1

    course = create(:project, slug: 'course-test-2', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'as_many_groups_as_was_created')

    user = create(:user)
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 4
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 2

    course = create(:project, slug: 'course-test-3', max_group_size: 1, max_number_of_groups: 2, selection_group_type: 'no_group_number_limitation')

    user = create(:user)
    group = create(:project, based_on_project: course, name: { 'de' => 'Gruppe-1' })

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: group.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 6
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 3
  end

  it 'join course without max_number_of_groups - fixed_number_of_groups' do
    course = create(:project, slug: 'course-test', max_group_size: 2, selection_group_type: 'fixed_number_of_groups')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'join course without max_group_size  ' do
    course = create(:project, slug: 'course-test', selection_group_type: 'fixed_number_of_groups')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    course = create(:project, slug: 'course-test-2', selection_group_type: 'as_many_groups_as_was_created')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 2
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0

    course = create(:project, slug: 'course-test-3', selection_group_type: 'no_group_number_limitation')

    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        course_id: course.id
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectMember.count).to eq 0
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'coruse have a group_type which is not covered ' do
    # TODO: Type which is not used
  end
end
