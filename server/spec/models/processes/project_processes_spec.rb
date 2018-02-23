require 'rails_helper'
require 'fakefs/safe'

require_dependency 'error'

RSpec.describe Processes::ProjectProcesses do

  describe "Create" do
    subject { described_class.new(FactoryBot.build(:project, id: SecureRandom.uuid)) }

    context "project directory", :fakefs do
      before { fakefs_clone_projects_dir! }
      
      it 'can be created' do
        subject.create_project_directory
        expect(Dir.exist? subject.project.data_directory_path).to be true
      end

      it 'fails on duplicates' do
        subject.create_project_directory
        expect { subject.create_project_directory }.to raise_error EsqulinoError
      end
    end
  end
end
