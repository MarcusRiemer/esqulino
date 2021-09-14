class AddCourseProperties < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :max_group_size, :integer
    add_column :projects, :max_number_of_groups, :integer
    add_column :projects, :selection_group_type, :integer
  end
end
