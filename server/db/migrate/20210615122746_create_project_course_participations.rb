class CreateProjectCourseParticipations < ActiveRecord::Migration[6.1]
  def change
    create_table :project_course_participations, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.boolean :access_denied
      t.references :solution_project, null: false, type: :uuid, foreign_key: { to_table: 'projects' }
      t.references :assignments_project, null: false, type: :uuid, foreign_key: { to_table: 'projects' }
      t.timestamps
    end
  end
end
