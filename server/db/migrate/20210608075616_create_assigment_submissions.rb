class CreateAssigmentSubmissions < ActiveRecord::Migration[6.1]
  def change
    create_table :assigment_submissions, id: :uuid, default: 'gen_random_uuid()' do |t|
      #t.references :assigment, null: false, type: :uuid, foreign_key: true
      #t.references :assigment_submission_grade, null: true, type: :uuid, foreign_key: true

      t.timestamps
    end
  end
end
