# frozen_string_literal: true

require 'rails_helper'
require 'securerandom' # To make up unique slugs on the fly
require 'fileutils'    # To ease file comparision

RSpec.describe Seed::BlockLanguageSeed do
  let(:seed_data_dir) { Rails.configuration.sqlino[:seed][:data_dir] }
  let(:block_language) { FactoryBot.create(:block_language) }
  let(:payload) { block_language }

  let(:subject) { described_class.new(payload) }

  before(:each) do
    FileUtils.rm_rf(seed_data_dir, secure: true)
  end

  describe 'block language seed' do
    context 'when payload is grammar object'
    let(:payload) { block_language }
    it 'returns object' do
      expect(subject.seed).to be_a BlockLanguage
    end

    context 'when payload is grammar id' do
      let(:payload) { block_language.id }

      it 'returns object' do
        expect(subject.seed).to be_a BlockLanguage
      end
    end

    context 'when payload is project slug' do
      let(:payload) { block_language.slug }

      it 'returns project' do
        expect(subject.seed).to be_a BlockLanguage
      end
    end

    context 'store, destorys and loads' do
      it 'an empty block language (CREATE)' do
        bOrig = FactoryBot.create(:block_language)

        Seed::BlockLanguageSeed.new(bOrig).start_store

        bOrig.destroy!
        Seed::BlockLanguageSeed.new(bOrig.id).start_load
        bLoadData = BlockLanguage.find_by(id: bOrig.id)

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoadData)
      end

      it 'an empty block language by id (CREATE)' do
        bOrig = FactoryBot.create(:block_language)

        Seed::BlockLanguageSeed.new(bOrig.id).start_store

        bOrig.destroy!
        Seed::BlockLanguageSeed.new(bOrig.id).start_load
        bLoadData = BlockLanguage.find_by(id: bOrig.id)

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoadData)
      end

      it 'an empty block language by slug (CREATE)' do
        pOrig = FactoryBot.create(:block_language, slug: 'test123')

        Seed::BlockLanguageSeed.new(pOrig.id).start_store

        pOrig.destroy!
        Seed::BlockLanguageSeed.new(pOrig.slug).start_load
        pLoadData = BlockLanguage.find_by(slug: pOrig.slug)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it 'throws if project cant be found by slug' do
        expect do
          Seed::BlockLanguageSeed.new('nonexistant').start_load
        end.to raise_exception RuntimeError
      end
    end

    context 'stores and reloads ' do
      it 'an empty block language (CREATE)' do
        bOrig = FactoryBot.create(:block_language)

        Seed::BlockLanguageSeed.new(bOrig).start_store

        # Making a change after storing
        bOrig.update_column('name', 'changed')

        Seed::BlockLanguageSeed.new(bOrig.id).start_load
        gLoadData = BlockLanguage.find_by(id: bOrig.id)
        bOrig.reload

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(gLoadData)
      end
    end
  end

  def identifying_attributes(model)
    model.attributes.except('created_at', 'updated_at')
  end
end
