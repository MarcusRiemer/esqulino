require 'rails_helper'

RSpec.describe Seed::ProjectSeed do
  let(:project) { FactoryBot.create(:project, name: "Test Proejct")}
  let(:project_payload) { project }
  let(:subject) { described_class.new(project_payload) }
  
  before do
    FileUtils.rm_rf(Seed::Base::BASE_SEED_DIRECTORY, :secure => true)
  end

  describe '#project' do
    context 'when payload is project object'
      it 'gets project object' do
        expect(subject.project).to be_a Project
      end
    
    context 'when payload is project id' do
      let(:project_payload) { project.id }
      
      it 'when payload is a project id' do
        expect(subject.project.first).to be_a Project
      end
    end

    context 'when payload is project slug' do
      let(:project_payload) { project.slug }
        
      it 'when payload is a project id' do
        expect(subject.project.first).to be_a Project
      end
    end

    context 'without payload' do
        let(:subject) { described_class.new }
          
        it 'returns empty' do
          expect(subject.project).to eq([])
        end
      end
  end

  describe '#store_project' do
    it 'stores the project in the seed directory' do
      subject.store_project
      Dir.chdir(Seed::Base::BASE_SEED_DIRECTORY)
      expect(Dir.children("projects")).to eq([subject.project.id])
    end
  end
end