require 'rails_helper'

RSpec.describe Mutations::Projects::UpdateProjectGroupSettings do
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

  it 'normal work' do
    course = create(:project, slug: 'course-test')

    mut = described_class.new(**init_args(user: course.user))

    res = mut.resolve(
      id: course.id,
      maxGroupSize: 5,
      maxNumberOfGroups: 3,
      public: true
    )

    expect(Project.find(course.id).public).to eq true
    expect(Project.find(course.id).max_group_size).to eq 5
    expect(Project.find(course.id).max_number_of_groups).to eq 3
    expect(Project.find(course.id).selection_group_type).to eq nil

    res = mut.resolve(
      id: course.id,
      maxGroupSize: 1,
      maxNumberOfGroups: 5,
      selectionGroupType: 'fixed_number_of_groups',
      public: true
    )

    expect(Project.find(course.id).public).to eq true
    expect(Project.find(course.id).max_group_size).to eq 1
    expect(Project.find(course.id).max_number_of_groups).to equal(5)
    expect(Project.find(course.id).selection_group_type).to eq 'fixed_number_of_groups'

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      maxGroupSize: 10,
      maxNumberOfGroups: 30,
      selectionGroupType: 'as_many_groups_as_was_created'
    )

    expect(Project.find(course.id).public).to eq true
    expect(Project.find(course.id).max_group_size).to eq 10
    expect(Project.find(course.id).max_number_of_groups).to eq 30
    expect(Project.find(course.id).selection_group_type).to eq 'as_many_groups_as_was_created'

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'no_group_number_limitation'
    )

    expect(Project.find(course.id).public).to eq true
    expect(Project.find(course.id).max_group_size).to eq 10
    expect(Project.find(course.id).max_number_of_groups).to eq 30
    expect(Project.find(course.id).selection_group_type).to eq 'no_group_number_limitation'

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'self_selection'
    )

    expect(Project.find(course.id).public).to eq true
    expect(Project.find(course.id).max_group_size).to eq 10
    expect(Project.find(course.id).max_number_of_groups).to eq 30
    expect(Project.find(course.id).selection_group_type).to eq 'self_selection'

    date = DateTime.new(2000, 1, 1, 5)
    date_later = DateTime.new(2000, 3, 6, 5)
    res = mut.resolve(
      id: course.id,
      enrollmentStart: date,
      enrollmentEnd: date_later
    )

    expect(Project.find(course.id).enrollment_start).to eq date
    expect(Project.find(course.id).enrollment_end).to eq date_later

    res = mut.resolve(
      id: course.id,
      enrollmentStart: nil,
      enrollmentEnd: nil
    )

    expect(Project.find(course.id).enrollment_start).to eq nil
    expect(Project.find(course.id).enrollment_end).to eq nil
  end

  it 'type fixed_number_of_groups without maxNumberOfGroups' do
    course = create(:project, slug: 'course-test')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        maxGroupSize: 1,
        selectionGroupType: 'fixed_number_of_groups'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        maxNumberOfGroups: nil
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    course = create(:project, slug: 'course-test1', max_number_of_groups: 5)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      maxGroupSize: 1,
      selectionGroupType: 'fixed_number_of_groups'
    )

    expect(Project.find(course.id).max_group_size).to eq 1
    expect(Project.find(course.id).max_number_of_groups).to eq 5
    expect(Project.find(course.id).selection_group_type).to eq 'fixed_number_of_groups'
  end

  it 'no group size' do
    course = create(:project, slug: 'course-test')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        maxNumberOfGroups: 1,
        selectionGroupType: 'fixed_number_of_groups'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    expect do
      mut.resolve(
        id: course.id,
        selectionGroupType: 'as_many_groups_as_was_created'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    expect do
      mut.resolve(
        id: course.id,
        selectionGroupType: 'no_group_number_limitation'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    expect do
      mut.resolve(
        id: course.id,
        selectionGroupType: 'self_selection'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil

    # The max_group_size is already set
    course = create(:project, slug: 'course-test-1', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      maxNumberOfGroups: 1,
      selectionGroupType: 'fixed_number_of_groups'
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq 1
    expect(Project.find(course.id).selection_group_type).to eq 'fixed_number_of_groups'

    course = create(:project, slug: 'course-test-2', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'as_many_groups_as_was_created'
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq 'as_many_groups_as_was_created'

    course = create(:project, slug: 'course-test-3', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'no_group_number_limitation'
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq 'no_group_number_limitation'

    course = create(:project, slug: 'course-test-4', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'self_selection'
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq 'self_selection'
  end

  it 'negativ maxGroupSize' do
    course = create(:project, slug: 'course-test')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        maxGroupSize: -10,
        selectionGroupType: 'fixed_number_of_groups'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil
  end

  it 'negativ maxNumberOfGroups' do
    course = create(:project, slug: 'course-test')

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        maxGroupSize: 1,
        maxNumberOfGroups: -10,
        selectionGroupType: 'fixed_number_of_groups'
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil
  end

  it 'no permission' do
    course = create(:project, slug: 'course-test')
    user = create(:user)

    mut = described_class.new(**init_args(user: user))
    expect do
      mut.resolve(
        id: course.id,
        maxGroupSize: 10,
        maxNumberOfGroups: 30,
        selectionGroupType: 'as_many_groups_as_was_created'
      )
    end.to raise_error(Pundit::NotAuthorizedError)

    expect(Project.find(course.id).max_group_size).to eq nil
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil
  end

  it 'enrollment Dates' do
    date = DateTime.new(2000, 1, 1, 5)
    date_later = DateTime.new(2000, 3, 6, 5)

    course = create(:project, slug: 'course-test-1', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      maxNumberOfGroups: 1,
      selectionGroupType: 'fixed_number_of_groups',
      enrollmentStart: date,
      enrollmentEnd: date_later
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq 1
    expect(Project.find(course.id).selection_group_type).to eq 'fixed_number_of_groups'
    expect(Project.find(course.id).enrollment_start).to eq date
    expect(Project.find(course.id).enrollment_end).to eq date_later

    date = DateTime.new(2001, 1, 1, 5)

    course = create(:project, slug: 'course-test-2', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      maxNumberOfGroups: 1,
      selectionGroupType: 'fixed_number_of_groups',
      enrollmentStart: date
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq 1
    expect(Project.find(course.id).selection_group_type).to eq 'fixed_number_of_groups'
    expect(Project.find(course.id).enrollment_start).to eq date
    expect(Project.find(course.id).enrollment_end).to eq nil

    date = DateTime.new(2001, 1, 1, 5)

    course = create(:project, slug: 'course-test-3', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    res = mut.resolve(
      id: course.id,
      selectionGroupType: 'as_many_groups_as_was_created',
      enrollmentEnd: date
    )

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq 'as_many_groups_as_was_created'
    expect(Project.find(course.id).enrollment_start).to eq nil
    expect(Project.find(course.id).enrollment_end).to eq date

    date = DateTime.new(2001, 1, 1, 5)
    date_later = DateTime.new(2000, 3, 6, 5)

    course = create(:project, slug: 'course-test-4', max_group_size: 4)

    mut = described_class.new(**init_args(user: course.user))
    expect do
      mut.resolve(
        id: course.id,
        selectionGroupType: 'no_group_number_limitation',
        enrollmentStart: date,
        enrollmentEnd: date_later
      )
    end.to raise_error(ArgumentError)

    expect(Project.find(course.id).max_group_size).to eq 4
    expect(Project.find(course.id).max_number_of_groups).to eq nil
    expect(Project.find(course.id).selection_group_type).to eq nil
    expect(Project.find(course.id).enrollment_start).to eq nil
    expect(Project.find(course.id).enrollment_end).to eq nil
  end


end
