require 'rails_helper'

RSpec.describe ProjectStructure do

  describe "slug" do
    subject { described_class.new(name: "Something Special" ) }

    context "is created" do
      it "with parameterized name" do
        subject.save!
        expect(subject.slug).to eq("something-special")
      end
    end

      context "validates with" do
        let(:project) { described_class.create(name: "Something Special1" ) }
        it "uniqne slug" do
          expect(project).to be_valid
        end
      end
  end
end
