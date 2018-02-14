require 'rails_helper'
require 'fakefs/safe'

require_dependency 'error'

RSpec.describe Builders::ProjectUtility do

  describe "Create" do

    let(:db_type) { "sqlite3" }
    let(:default_uuid) { "c8832d3d-3809-472b-8dc7-2344e358cab5" }
    subject { described_class.new(id: default_uuid, db_type: db_type) }

    context "project directory" do
      it 'ends with the uuid' do
        expect(subject.project_path).to end_with(default_uuid)
      end
      
      it 'can be created' do
        FakeFS.with_fresh do
          FakeFS::FileSystem.clone(Rails.application.config.sqlino[:projects_dir])
          subject.create_project_directory
          expect(Dir.exist? subject.project_path).to be true
        end
      end

      it 'fails on duplicates' do
        FakeFS.with_fresh do
          FakeFS::FileSystem.clone(Rails.application.config.sqlino[:projects_dir])
          subject.create_project_directory
          expect { subject.create_project_directory }.to raise_error EsqulinoError
        end
      end
    end

    # TODO: Create proper test cases for database files
    context "local database" do
      it "stes the database folder" do
      end

      it "sets a sqlite database" do
      end
    end
  end

  def uuid
    @id ||= SecureRandom.uuid
  end
end
