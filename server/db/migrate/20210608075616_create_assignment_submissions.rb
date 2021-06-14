class CreateAssignmentSubmissions < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_submissions, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.timestamps
    end
  end
end
