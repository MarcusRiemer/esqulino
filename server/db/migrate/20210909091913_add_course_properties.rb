class AddCourseProperties < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :max_group_size, :integer, default: 1
    add_column :projects, :max_number_of_groups, :integer
    add_column :projects, :selection_group_type, :integer
    add_column :projects, :enrollment_start, :timestamp
    add_column :projects, :enrollment_end, :timestamp
    add_column :projects, :course_template, :boolean
  end
end
