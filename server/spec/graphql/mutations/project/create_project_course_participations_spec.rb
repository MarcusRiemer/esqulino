require 'rails_helper'

# TODO: Rename der Name ist zu nah an dem anderen
RSpec.fdescribe Mutations::Projects::CreateProjectCourseParticipations do
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

  it 'Create course simple' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe-###",
      start_name_counter: 10
    )

    expect(Project.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 3
    expect(Project.find_by(name: { 'de' => 'Gruppe-010' }).based_on_project).to eq project
    expect(Project.find_by(name: { 'de' => 'Gruppe-011' }).assignments.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-012' }).user).to eq project.user

  end

  it 'without a # symbol' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe",
      start_name_counter: 10
    )

    expect(Project.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 3
    expect(Project.where(name: { 'de' => 'Gruppe' }).count).to eq 3
  end

  it ' with more than one # phrases' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "###Gruppe-###",
      start_name_counter: 10
    )

    expect(Project.count).to eq 4
    expect(ProjectCourseParticipation.count).to eq 3
    expect(Project.find_by(name: { 'de' => '010Gruppe-###' })).not_to eq nil
    expect(Project.find_by(name: { 'de' => '011Gruppe-###' })).not_to eq nil
    expect(Project.find_by(name: { 'de' => '012Gruppe-###' })).not_to eq nil
  end

  it 'negativ start_name_counter ' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    expect{mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "###Gruppe-###",
      start_name_counter: -1
    )}.to raise_error(ArgumentError)

    expect{mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe-",
      start_name_counter: -10
    )}.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'Create course simple without permissions' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: user1))

    expect do
      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: 3,
        name: "Gruppe-###",
        start_name_counter: 10
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'create groups two times for on project' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    res = mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe-###",
      start_name_counter: 10
    )

    res = mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe-###",
      start_name_counter: 110
    )

    expect(Project.count).to eq 7
    expect(ProjectCourseParticipation.count).to eq 6
    expect(Project.find_by(name: { 'de' => 'Gruppe-012' }).based_on_project).to eq project
    expect(Project.find_by(name: { 'de' => 'Gruppe-012' }).assignments.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-012' }).user).to eq project.user

    expect(Project.find_by(name: { 'de' => 'Gruppe-110' }).based_on_project).to eq project
    expect(Project.find_by(name: { 'de' => 'Gruppe-110' }).assignments.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-110' }).user).to eq project.user
  end

  it 'negativ number_of_groups' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))

    expect do
      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: -3,
        name: "Gruppe-###",
        start_name_counter: 110
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 0

    expect do
      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: 0,
        name: "Gruppe-###",
        start_name_counter: 110
      )
    end.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 0
  end

  it 'create with all other referenzes' do
    project2 = create(:project, slug: 'course-123', course_template: true)

    assignment = create(:assignment, project: project2, name: 'test')

    code_resource = create(:code_resource, project: project2)

    project_database = create(:project_database, project: project2, name: '1')
    project_source = create(:project_source, project: project2, title: '1')
    block_language = create(:project_uses_block_language, project: project2)
    create(:project_member, project: project2, membership_type: 'participant')
    create(:project_member, project: project2, membership_type: 'admin')

    mut = described_class.new(**init_args(user: project2.user))

    res = mut.resolve(
      based_on_project_id: project2.id,
      number_of_groups: 10,
      name: "Gruppe-#",
      start_name_counter: 0
    )

    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).code_resources.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).assignments.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).project_databases.first).not_to eq project_database
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).project_databases.count).to eq  1
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).project_sources.first).not_to eq code_resource
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).project_sources.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-1' }).project_uses_block_languages.count).to eq 2

    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).code_resources.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).assignments.count).to eq 0
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).project_databases.first).not_to eq project_database
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).project_databases.count).to eq  1
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).project_sources.first).not_to eq code_resource
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).project_sources.count).to eq 1
    expect(Project.find_by(name: { 'de' => 'Gruppe-3' }).project_uses_block_languages.count).to eq 2

    expect(Project.count).to eq 11
    expect(ProjectCourseParticipation.count).to eq 10
    expect(ProjectMember.count).to eq 2
    expect(ProjectDatabase.count).to eq 11
    expect(ProjectSource.count).to eq 11
    expect(ProjectUsesBlockLanguage.count).to eq 22
  end

  it 'less # than number_of_groups' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))


      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: 13,
        name: "Gruppe-#",
        start_name_counter: 1
      )

      expect(ProjectCourseParticipation.count).to eq 13
    end

  it 'less # than start_name_counter' do
    project = create(:project, slug: 'course-test', course_template: true)
    assignment = create(:assignment, project: project, name: 'test')
    user1 = create(:user)

    mut = described_class.new(**init_args(user: project.user))


      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: 1,
        name: "Gruppe-#",
        start_name_counter: 11
      )

      expect(ProjectCourseParticipation.count).to eq 1


      mut.resolve(
        based_on_project_id: project.id,
        number_of_groups: 12,
        name: "Gruppe-#",
        start_name_counter: 112
      )

      expect(ProjectCourseParticipation.count).to eq 13

  end

  it 'not a course' do

    project  = create(:project)
   
    mut = described_class.new(**init_args(user: project.user))

   expect{mut.resolve(
      based_on_project_id: project.id,
      number_of_groups: 3,
      name: "Gruppe",
      start_name_counter: 10
    )}.to raise_error(ArgumentError)

    expect(Project.count).to eq 1
    expect(ProjectCourseParticipation.count).to eq 0

    course = create(:project, slug: 'course-test', course_template: true)
    group  = create(:project, based_on_project: course)

    mut = described_class.new(**init_args(user: group.user))

    expect{mut.resolve(
      based_on_project_id: group.id,
      number_of_groups: 3,
      name: "Gruppe",
      start_name_counter: 10
    )}.to raise_error(ArgumentError)

    expect(Project.count).to eq 3
    expect(ProjectCourseParticipation.count).to eq 1
  end
end
