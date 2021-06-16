class CreateProjectCourseParticipations < ActiveRecord::Migration[6.1]
  def change
    create_table :project_course_participations, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.boolean :access_denied
      t.references :project, null: false, type: :uuid, foreign_key: true

      t.timestamps
    end

    add_reference :projects, :project_course_participation, null: true, type: :uuid, foreign_key: true
  
  end
end
