# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BlockLanguage do
  context 'name' do
    it 'rejects an missing name' do
      res = FactoryBot.build(:block_language, name: nil)

      res.validate
      expect(res.errors['name'].length).to be 1
    end
  end

  context 'slug' do
    it 'allows missing slugs' do
      res = FactoryBot.build(:block_language, slug: nil)
      expect(res.valid?).to be true
    end

    it 'rejects blank slugs' do
      res = FactoryBot.build(:block_language, slug: '')
      expect(res.valid?).to be false
    end

    it 'rejects duplicate slugs' do
      FactoryBot.create(:block_language, slug: 'dup')
      res_2 = FactoryBot.build(:block_language, slug: 'dup')

      res_2.validate
      expect(res_2.errors['slug'].length).to be 1
    end
  end

  context 'to_full_api_response' do
    it 'works for empty languages' do
      block_language = FactoryBot.build(:block_language, id: SecureRandom.uuid)
      api_response = block_language.to_full_api_response

      expect(api_response).to validate_against 'BlockLanguageDescription'
      expect(api_response['id']).to eq block_language.id
      expect(api_response['name']).to eq block_language.name
      expect(api_response['slug']).to eq block_language.slug
    end
  end

  context 'scope_list' do
    it 'For manual block language' do
      FactoryBot.create(:block_language, id: SecureRandom.uuid)
      scoped_b = BlockLanguage.scope_list.first

      expect(scoped_b['generated']).to equal false
    end
  end

  context 'to_list_api_response' do
    it "with 'generated' field" do
      b = FactoryBot.create(:block_language, id: SecureRandom.uuid)
      api_response = BlockLanguage.scope_list.first.to_list_api_response(options: { include_list_calculations: true })

      expect(api_response).to validate_against 'BlockLanguageListItemDescription'
      expect(api_response['id']).to eq b.id
      expect(api_response['name']).to eq b.name
      expect(api_response['slug']).to eq b.slug
      expect(api_response['generated']).to equal false
    end

    it "without 'generated' field" do
      b = FactoryBot.create(:block_language, id: SecureRandom.uuid)
      api_response = BlockLanguage.scope_list.first.to_list_api_response(options: { include_list_calculations: false })

      expect(api_response).to validate_against 'BlockLanguageListDescription'
      expect(api_response['id']).to eq b.id
      expect(api_response['name']).to eq b.name
      expect(api_response['slug']).to eq b.slug
      expect(api_response).not_to have_key('generated')
    end
  end

  context 'emit_generated_blocks!' do
    it "Doesn't regenerate without generator instructions" do
      block_language = create(:block_language)
      expect(block_language.emit_generated_blocks!).to eq nil
    end

    it 'Overwrites previous block data' do
      block_language = create(:block_language, :auto_generated_blocks)

      # Set some specific content that will be overwritten when regeneratng
      block_language.root_css_classes = ['spec']

      result = block_language.emit_generated_blocks!(IdeService.guaranteed_instance)
      expect(result['root_css_classes']).not_to eq ['spec']
    end
  end

  context 'regenerate_from_code_resource!' do
    it "Doesn't regenerate without a code resource" do
      block_language = create(:block_language)
      expect(block_language.regenerate_from_code_resource!).to eq []
    end

    it 'Properly regenerates the top level classes' do
      css_classes_to_add = %w[activate-keyword activate-block-outline]

      meta_code_resource = create(
        :code_resource,
        ast: {
          'name' => 'Document',
          'language' => 'MetaBlockLang',
          'children' => {
            'RootCssClasses' => css_classes_to_add.map do |c|
              {
                'name' => 'CssClass',
                'language' => 'MetaBlockLang',
                'properties' => {
                  'Name' => c
                }
              }
            end
          }
        }
      )

      block_language = create(
        :block_language,
        generated_from: meta_code_resource,
        root_css_classes: [] # Will be added during regeneration
      )

      regenerated = block_language.regenerate_from_code_resource!(IdeService.guaranteed_instance)
      expect(regenerated).to eq [block_language]
      expect(block_language.root_css_classes).to eq css_classes_to_add
    end
  end

  it 'can be valid' do
    res = FactoryBot.build(:block_language)
    expect(res.valid?).to be true
  end

  it 'prints a readable identification' do
    res = FactoryBot.create(:block_language, slug: 'iddy')
    readable = res.readable_identification
    expect(readable).to include res.id
    expect(readable).to include res.name
    expect(readable).to include res.slug
  end
end
