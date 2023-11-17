require 'rails_helper'

RSpec.describe Resolvers::BlockLanguageResolver do
  it 'can be instantiated' do
    res = described_class.new
    expect(res).not_to be_nil
  end

  it 'lists all available block languages' do
    FactoryBot.create(:block_language)
    FactoryBot.create(:block_language)
    FactoryBot.create(:block_language)

    expect(described_class.connection.length).to eq 3
  end

  it 'returns the relevant single language' do
    b = FactoryBot.create(:block_language)
    FactoryBot.create(:block_language)
    FactoryBot.create(:block_language)

    expect(described_class.single(b.id)).to eq b
  end
end
