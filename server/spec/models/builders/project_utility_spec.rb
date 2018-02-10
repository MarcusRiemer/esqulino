require 'rails_helper'
require 'fakefs/safe'

RSpec.describe Builders::ProjectUtility do
 
  describe "Create" do
  
    let(:db_type) { "sqlite3" }
    subject { described_class.new(id: uuid, db_type: db_type) }

    context "project directory" do
      it 'with proejct id' do
        FakeFS.with_fresh do
          byebug
          p_dir = subject.create_project_directory
          # assert File.directory?(uuid)
          expect(p_dir).to include(uuid)
        end 
      end
    end
    
    # TODO: Create proper test cases for database files
    fcontext "local database" do
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