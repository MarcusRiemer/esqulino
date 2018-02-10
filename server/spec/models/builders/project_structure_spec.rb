require 'rails_helper'

RSpec.describe Builders::ProjectStructure do
  subject { described_class.new(project: project) }

  describe 'Project structure' do
    let(:project) { build(:project) }
    let(:sources) { create(:project_source, project: project) }   
    context 'basic data' do
      it 'shuld have name' do
        expect(subject.data).to have_key('name')
      end

      it 'should have slug' do
        expect(subject.data).to have_key('slug')
      end
    end

    context 'merged data' do
      it 'should have schema' do
        subject.build
        expect(subject.data).to have_key('schema')
      end

      xit 'should have sources' do
        expect(subject.data).to_not be_empty 
      end
    end
  end

  def schema
    []
  end
end