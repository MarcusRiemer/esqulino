require 'rails_helper'

RSpec.describe ProjectMailer, type: :mailer do
  describe 'Project Creation' do
    it 'Admin Mail (en)' do
      proj = FactoryBot.build(:project, id: 'c6c6dbb8-eb88-4731-95ff-f966268de143')
      mail = ProjectMailer.with(project: proj).created_admin

      expect(mail.subject).to include(proj.name['en'])
      expect(mail.to).to eq([Rails.configuration.sqlino[:mail][:admin]])

      expect(mail.body.to_s).to include(proj.name['en'])
      expect(mail.body.to_s).to include(proj.id)
    end

    it 'Admin Mail (de)' do
      proj = FactoryBot.build(
        :project,
        id: 'c6c6dbb8-eb88-4731-95ff-f966268de143',
        name: { 'de' => 'Deutsch' }
      )
      mail = ProjectMailer.with(project: proj).created_admin

      expect(mail.subject).to include(proj.name['de'])
      expect(mail.to).to eq([Rails.configuration.sqlino[:mail][:admin]])

      expect(mail.body.to_s).to include(proj.name['de'])
      expect(mail.body.to_s).to include(proj.id)
    end
  end
end
