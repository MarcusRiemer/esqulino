require 'rails_helper'

RSpec.describe BlockLanguageGenerator, type: :model do
  it "Can be created via factory" do
    res = FactoryBot.build(:block_language_generator)
    res.save!
  end
  
  context "name" do
    it "rejects a missing name" do
      res = FactoryBot.build(:block_language_generator, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end

    it "rejects a missing target name" do
      res = FactoryBot.build(:block_language_generator, target_name: nil)

      res.validate
      expect(res.errors["target_name"].length).to be 1
    end
  end
end
