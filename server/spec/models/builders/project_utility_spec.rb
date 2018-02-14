require 'rails_helper'
require 'fakefs/safe'

require_dependency 'error'

RSpec.describe Builders::ProjectUtility do

  describe "Create" do

    let(:db_type) { "sqlite3" }
    subject { described_class.new(id: uuid, db_type: db_type) }

    context "project directory" do
      it 'with project id' do
        # FakeFS.with_fresh do
          subject.create_project_directory
          expect(Dir.exist? subject.project_path).to be true
        # end
      end

      it 'fails on duplicates' do
        # FakeFS.with_fresh do
          subject.create_project_directory
          expect { subject.create_project_directory }.to raise_error EsqulinoError
        # end
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
