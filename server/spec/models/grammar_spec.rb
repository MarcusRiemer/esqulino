# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Grammar, type: :model do
  context 'slug' do
    it 'allows empty slugs' do
      res = FactoryBot.build(:grammar, slug: nil)
      expect(res.valid?).to be true
    end

    it 'rejects slugs that are too short' do
      res = FactoryBot.build(:grammar, slug: '')

      res.validate
      expect(res.errors['slug'].length).to eq 1
    end

    it 'rejects identical slugs' do
      FactoryBot.create(:grammar, slug: 'duplicate')
      expect { FactoryBot.create(:grammar, slug: 'duplicate') }.to raise_error ActiveRecord::RecordInvalid

      expect(Grammar.all.count).to eq 1
    end

    it 'stores two grammars with empty slugs' do
      FactoryBot.create(:grammar, slug: nil)
      FactoryBot.create(:grammar, slug: nil)

      expect(Grammar.all.count).to eq 2
      expect(Grammar.where(slug: nil).count).to eq 2
    end
  end

  context 'name' do
    it 'rejects a missing name' do
      res = FactoryBot.build(:grammar, name: nil)

      res.validate
      expect(res.errors['name'].length).to eq 1
    end
  end

  context 'document' do
    it 'Empty' do
      res = FactoryBot.build(:grammar)
      expect(res.document).to eq({
                                   'foreign_types' => {},
                                   'foreign_visualisations' => {},
                                   'types' => {},
                                   'visualisations' => {}
                                 })
    end

    it 'With root' do
      root = { 'languageName' => 'l', 'typeName' => 't' }
      res = FactoryBot.build(:grammar, root:)
      expect(res.document).to eq({
                                   'root' => root,
                                   'foreign_types' => {},
                                   'foreign_visualisations' => {},
                                   'types' => {},
                                   'visualisations' => {}
                                 })
    end
  end

  context 'types' do
    let(:type_empty) do
      {
        'type' => 'concrete',
        'attributes' => []
      }
    end

    let(:type_visualise) do
      {
        'type' => '',
        'attributes' => []
      }
    end

    let(:type_terminal_a) do
      {
        'type' => 'concrete',
        'attributes' => [
          {
            'type' => 'terminal',
            'symbol' => 'a'
          }
        ]
      }
    end

    context 'all_types' do
      it 'no types at all' do
        g = FactoryBot.build(:grammar)
        expect(g.all_types).to eq({})
      end

      it 'Empty local language' do
        g = FactoryBot.build(:grammar, types: { 'l' => {} })
        expect(g.all_types).to eq({ 'l' => {} })
      end

      it 'Empty foreign language' do
        g = FactoryBot.build(:grammar, foreign_types: { 'l' => {} })
        expect(g.all_types).to eq({ 'l' => {} })
      end

      it 'Identical empty foreign and local language' do
        g = FactoryBot.build(:grammar, types: { 'l' => {} }, foreign_types: { 'l' => {} })
        expect(g.all_types).to eq({ 'l' => {} })
      end

      it 'Different empty foreign and local language' do
        g = FactoryBot.build(:grammar, types: { 'l1' => {} }, foreign_types: { 'l2' => {} })
        expect(g.all_types).to eq({ 'l1' => {}, 'l2' => {} })
      end

      it 'Local language with single type' do
        g = FactoryBot.build(:grammar, types: {
                               'l' => {
                                 't' => type_empty
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'Foreign language with single type' do
        g = FactoryBot.build(:grammar, foreign_types: {
                               'l' => {
                                 't' => type_empty
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'Local and foreign language with identical single type' do
        g = FactoryBot.build(:grammar,
                             types: {
                               'l' => {
                                 't' => type_empty
                               }
                             },
                             foreign_types: {
                               'l' => {
                                 't' => type_empty
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'Local precedence: Termninal a' do
        g = FactoryBot.build(:grammar,
                             types: {
                               'l' => {
                                 't' => type_terminal_a
                               }
                             },
                             foreign_types: {
                               'l' => {
                                 't' => type_empty
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't' => type_terminal_a } })
      end

      it 'Local precedence: Empty' do
        g = FactoryBot.build(:grammar,
                             types: {
                               'l' => {
                                 't' => type_empty
                               }
                             },
                             foreign_types: {
                               'l' => {
                                 't' => type_terminal_a
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'Local precedence: Termninal a, additional local' do
        g = FactoryBot.build(:grammar,
                             types: {
                               'l' => {
                                 't1' => type_terminal_a,
                                 't2' => type_terminal_a
                               }
                             },
                             foreign_types: {
                               'l' => {
                                 't1' => type_empty
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't1' => type_terminal_a, 't2' => type_terminal_a } })
      end

      it 'Local precedence: Termninal a, additional foreign' do
        g = FactoryBot.build(:grammar,
                             types: {
                               'l' => {
                                 't1' => type_terminal_a
                               }
                             },
                             foreign_types: {
                               'l' => {
                                 't1' => type_empty,
                                 't2' => type_terminal_a
                               }
                             })

        expect(g.all_types).to eq({ 'l' => { 't1' => type_terminal_a, 't2' => type_terminal_a } })
      end
    end

    context 'refresh_from_references!' do
      it "doesn't extend anything" do
        g = FactoryBot.build(:grammar)

        g.refresh_from_references!

        expect(g.foreign_types).to eq({})
      end

      it 'The base grammar has no types' do
        origin = FactoryBot.create(:grammar)
        target = FactoryBot.create(:grammar)
        origin.grammar_reference_origins.create(target:, reference_type: :include_types)

        origin.refresh_from_references!

        expect(target.foreign_types).to eq({})
      end

      it 'The extended grammar has a local type' do
        origin = FactoryBot.create(:grammar)
        target = FactoryBot.create(:grammar, types: { 'l' => { 't' => type_empty } })
        origin.grammar_reference_origins.create(target:, reference_type: :include_types)

        origin.refresh_from_references!

        expect(origin.foreign_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'The extended grammar has a local visualization' do
        origin = FactoryBot.create(:grammar)
        target = FactoryBot.create(:grammar, types: { 'l' => { 't' => type_empty } })
        origin.grammar_reference_origins.create(target:, reference_type: :include_types)

        origin.refresh_from_references!

        expect(origin.foreign_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'The extended grammar has a foreign type' do
        origin = FactoryBot.create(:grammar)
        target = FactoryBot.create(:grammar, foreign_types: { 'l' => { 't' => type_empty } })
        origin.grammar_reference_origins.create(target:, reference_type: 'include_types')

        origin.refresh_from_references!

        expect(origin.foreign_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'The base grammar is visualized' do
        origin = FactoryBot.create(:grammar)
        target = FactoryBot.create(:grammar, types: { 'l' => { 't' => type_empty } })
        origin.grammar_reference_origins.create(target:, reference_type: :visualize)

        origin.refresh_from_references!

        expect(origin.foreign_types).to eq({ 'l' => { 't' => type_empty } })
      end

      it 'Multiple inclusions' do
        origin = FactoryBot.create(:grammar)
        target_1 = FactoryBot.create(:grammar)
        target_2 = FactoryBot.create(:grammar)
        origin.grammar_reference_origins.create(target: target_1, reference_type: :include_types)
        origin.grammar_reference_origins.create(target: target_2, reference_type: :include_types)

        expect { origin.refresh_from_references! }.to raise_error EsqulinoError::Base
      end

      it 'Mixed references' do
        origin = FactoryBot.create(:grammar)
        target_1 = FactoryBot.create(:grammar)
        target_2 = FactoryBot.create(:grammar)
        origin.grammar_reference_origins.create(target: target_1, reference_type: :include_types)
        origin.grammar_reference_origins.create(target: target_2, reference_type: :visualize)

        expect { origin.refresh_from_references! }.to raise_error EsqulinoError::Base
      end
    end
  end

  context 'based on CodeResource' do
    it 'may exist without a associated code resource' do
      res = FactoryBot.build(:grammar, generated_from: nil)

      res.validate
      expect(res.errors['generated_from']).to be_empty
    end

    it 'may not exist without a associated non-existant code resource' do
      res = FactoryBot.build(:grammar, generated_from_id: SecureRandom.uuid)

      expect { res.save }.to raise_error ActiveRecord::InvalidForeignKey
    end

    it 'can associate a code resource' do
      grammar = FactoryBot.create(:grammar, generated_from: nil)
      resource = FactoryBot.create(:code_resource, :grammar_single_type)

      grammar.generated_from = resource

      grammar.save!

      grammar.reload
      expect(grammar.generated_from_id).to eq resource.id
    end

    it 'regeneration from code_resource does not override foreign types' do
      foreign_types = {
        'foreign' => {
          'elsewhere' => {
            'type' => 'concrete',
            'attributes' => []
          }
        }
      }

      resource = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: resource, foreign_types:)

      expect(grammar.types).to eq({})
      expect(grammar.foreign_types).to eq foreign_types
      expect(grammar.root).to be_nil

      ide_service = IdeService.instantiate(allow_mock: false)
      did_change = grammar.regenerate_from_code_resource!(ide_service)

      expect(did_change).to eq [grammar]
      expect(grammar.root).to eq({ 'languageName' => 'lang', 'typeName' => 'root' })
      expect(grammar.types).to eq({
                                    'lang' => {
                                      'root' => {
                                        'type' => 'concrete',
                                        'attributes' => []
                                      }
                                    }
                                  })
      expect(grammar.foreign_types).to eq foreign_types
    end

    it 'can regenerate' do
      resource = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: resource)

      expect(grammar.types).to eq({})
      expect(grammar.root).to be_nil

      ide_service = IdeService.instantiate(allow_mock: false)
      did_change = grammar.regenerate_from_code_resource!(ide_service)

      expect(did_change).to eq [grammar]
      expect(grammar.root).to eq({ 'languageName' => 'lang', 'typeName' => 'root' })
      expect(grammar.types).to eq({
                                    'lang' => {
                                      'root' => {
                                        'type' => 'concrete',
                                        'attributes' => []
                                      }
                                    }
                                  })
    end

    it 'regenerates only once' do
      resource = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: resource)

      ide_service = IdeService.instantiate(allow_mock: false)

      expect(grammar.regenerate_from_code_resource!(ide_service)).to eq [grammar]
      expect(grammar.regenerate_from_code_resource!(ide_service)).to eq []
    end

    it 'regenerates a dependant block language' do
      resource = FactoryBot.create(:code_resource, :grammar_single_type)
      grammar = FactoryBot.create(:grammar, generated_from: resource)
      block_lang = FactoryBot.create(:block_language, :auto_generated_blocks, grammar:)

      ide_service = IdeService.instantiate(allow_mock: false)

      expect(grammar.regenerate_from_code_resource!(ide_service)).to eq [grammar, block_lang]
      expect(grammar.regenerate_from_code_resource!(ide_service)).to eq []
    end

    context 'references' do
      def grammar_document_references(category_name, *grammar_ids)
        {
          'language' => 'MetaGrammar',
          'name' => 'grammar',
          'properties' => {
            'name' => 'lang'
          },
          'children' => {
            category_name => [
              {
                'language' => 'MetaGrammar',
                'name' => 'grammarIncludes',
                'children' => {
                  'includes' => grammar_ids.map do |id|
                    {
                      'language' => 'MetaGrammar',
                      'name' => 'grammarRef',
                      'properties' => {
                        'grammarId' => id
                      }
                    }
                  end
                }
              }
            ]
          }
        }
      end

      it "ensure that the AST leads to 'include' instructions" do
        exp_uuid = 'f8528b38-cdee-4539-ac7a-b90fe0da6e37'

        res = FactoryBot.build(:code_resource, :meta_grammar,
                               ast: grammar_document_references('includes', exp_uuid))
        expect(res.ast).to validate_against 'NodeDescription'

        compiled_grammar_description = JSON.parse res.emit_ast!(IdeService.guaranteed_instance)
        expect(compiled_grammar_description['includes']).to eq [exp_uuid]
      end

      it 'no previous references, new code resource references' do
        inc_1 = FactoryBot.create(:grammar)

        resource = FactoryBot.create(:code_resource, :meta_grammar,
                                     ast: grammar_document_references('includes', inc_1.id))

        grammar = FactoryBot.create(:grammar, generated_from: resource)

        grammar.regenerate_from_code_resource!(IdeService.guaranteed_instance)

        expect(grammar.targeted_grammars).to match_array [inc_1]
      end

      it 'no previous references, new code resource visualization' do
        inc_1 = FactoryBot.create(:grammar)

        resource = FactoryBot.create(:code_resource, :meta_grammar,
                                     ast: grammar_document_references('visualizes', inc_1.id))
        grammar = FactoryBot.create(:grammar, generated_from: resource)

        grammar.regenerate_from_code_resource!(IdeService.guaranteed_instance)

        expect(grammar.targeted_grammars).to match_array [inc_1]
      end

      it 'replaces includes' do
        inc_1 = FactoryBot.create(:grammar)
        inc_2 = FactoryBot.create(:grammar)

        resource = FactoryBot.create(:code_resource, :meta_grammar,
                                     ast: grammar_document_references('includes', inc_2.id))
        grammar = FactoryBot.create(:grammar, generated_from: resource)

        grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

        grammar.regenerate_from_code_resource!(IdeService.guaranteed_instance)

        expect(grammar.targeted_grammars).to match_array [inc_2]
      end
    end
  end

  context 'references to other grammars' do
    it "doesn't have any references at all" do
      g = create(:grammar)

      expect(g.grammar_reference_origins).to eq []
      expect(g.targeted_grammars).to eq []
    end

    it 'includes types of another grammar' do
      origin = create(:grammar)
      target = create(:grammar)

      reference = create(:grammar_reference,
                         origin:,
                         target:,
                         reference_type: 'include_types')

      expect(origin.grammar_reference_origins).to eq [reference]
      expect(origin.targeted_grammars).to eq [target]
      expect(origin.includes_references).to eq [reference]
      expect(origin.visualizes_references).to eq []
    end

    it 'adds includes' do
      grammar = FactoryBot.create(:grammar)
      inc_1 = FactoryBot.create(:grammar)
      grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

      expect(grammar.targeted_grammars).to eq [inc_1]
    end

    it 'destroys includes, but leaves the grammar intact' do
      grammar = FactoryBot.create(:grammar)
      inc_1 = FactoryBot.create(:grammar)
      grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

      grammar.grammar_reference_origins.clear

      expect(grammar.grammar_reference_origins).to eq []
      expect(grammar.includes_references).to eq []
      expect(grammar.visualizes_references).to eq []

      expect(GrammarReference.all).to eq []
      expect(Grammar.all).to eq [grammar, inc_1]
    end

    it "doesn't change includes if they stay the same" do
      grammar = FactoryBot.create(:grammar)
      inc_1 = FactoryBot.create(:grammar)
      ref_1 = grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

      ref_1_again = GrammarReference.find_or_initialize_by(
        origin: grammar,
        target: inc_1,
        reference_type: 'include_types'
      )

      expect(ref_1).to eq ref_1_again
      expect(grammar.targeted_grammars).to eq [inc_1]
      expect(grammar.includes_references).to eq [ref_1_again]
      expect(grammar.visualizes_references).to eq []
    end

    it 'replaces an existing includes with a new includes' do
      grammar = FactoryBot.create(:grammar)
      inc_1 = FactoryBot.create(:grammar)
      grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

      expect(grammar.targeted_grammars).to eq [inc_1]

      inc_2 = FactoryBot.create(:grammar)

      # Not using factory bot here because we don't want the automatic association
      ref_2 = GrammarReference.find_or_initialize_by(
        origin: grammar,
        target: inc_2,
        reference_type: 'include_types'
      )

      # Replacing all existing references, this *must* delete ref_1 because it is now obsolete
      # but it must not delete inc_1 because thats still a valid grammar that exists.
      grammar.grammar_reference_origins = [ref_2]
      grammar.reload # Dependant relationships are cached

      expect(grammar.targeted_grammars).to eq [inc_2]
      expect(grammar.includes_references).to eq [ref_2]
      expect(grammar.visualizes_references).to eq []

      expect(GrammarReference.all).to match_array [ref_2]
      expect(Grammar.all).to match_array [grammar, inc_1, inc_2]
    end

    it 'add an new includes to an existing includes' do
      grammar = FactoryBot.create(:grammar)
      inc_1 = FactoryBot.create(:grammar)
      ref_1_orig = grammar.grammar_reference_origins.create(target: inc_1, reference_type: 'include_types')

      expect(grammar.targeted_grammars).to eq [inc_1]

      inc_2 = FactoryBot.create(:grammar)

      # Not using factory bot here because we don't want the automatic association

      # This exists
      ref_1 = GrammarReference.find_or_initialize_by(
        origin: grammar,
        target: inc_1,
        reference_type: 'include_types'
      )

      # This is new
      ref_2 = GrammarReference.find_or_initialize_by(
        origin: grammar,
        target: inc_2,
        reference_type: 'include_types'
      )

      # Adding one reference to the existing reference
      grammar.grammar_reference_origins = [ref_1, ref_2]

      grammar.reload # Dependant relationships are cached

      expect(ref_1_orig).to eq ref_1
      expect(grammar.targeted_grammars).to match_array [inc_1, inc_2]
      expect(grammar.includes_references).to match_array [ref_1, ref_2]
      expect(grammar.visualizes_references).to match_array []

      expect(GrammarReference.all).to match_array [ref_1, ref_2]
      expect(Grammar.all).to match_array [grammar, inc_1, inc_2]
    end
  end
end
