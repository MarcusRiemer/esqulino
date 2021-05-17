class ChangeProjectMemberTypeNameToMembershipType < ActiveRecord::Migration[6.1]
  def change
    rename_column :project_members, :type, :membership_type
  end
end
