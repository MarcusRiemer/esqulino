# frozen_string_literal: true

FactoryBot.define do
  factory :code_resource, class: CodeResource do
    name { 'Spec Code Resource' }
    association :project, factory: :project
    association :block_language, factory: :block_language
    association :programming_language, factory: :programming_language

    # Projects may allow or disallow block languages. We need to ensure
    # that created code resource is valid in the context of the given
    # project and block language (if the are given).
    after(:build) do |code_resource|
      project = code_resource.project
      block_language = code_resource.block_language
      project.block_languages << block_language if project && block_language && !project.block_languages.include?(block_language)
    end

    trait :meta_grammar do
      association :programming_language, factory: %i[programming_language meta_grammar]
      association :block_language, factory: %i[block_language grammar_meta]
    end

    trait :grammar_code_resource_references do
      association :block_language, factory: %i[block_language grammar_code_resource_references]
    end

    trait :grammar_single_type do
      meta_grammar
      ast do
        {
          'children' => {
            'nodes' => [
              {
                'language' => 'MetaGrammar',
                'name' => 'concreteNode',
                'properties' => {
                  'languageName' => 'lang',
                  'typeName' => 'root'
                }
              }
            ],
            'root' => [
              {
                'language' => 'MetaGrammar',
                'name' => 'nodeRefOne',
                'properties' => {
                  'languageName' => 'lang',
                  'typeName' => 'root'
                }
              }
            ]
          },
          'language' => 'MetaGrammar',
          'name' => 'grammar',
          'properties' => {
            'name' => 'lang'
          }
        }
      end
    end

    # A query that re-uses the same columns in the SELECT portion
    trait :sql_key_value_select_double do |query|
      association :programming_language, factory: %i[programming_language sql]
      query.ast do
        {
          'name' => 'querySelect',
          'language' => 'sql',
          'children' => {
            'from' => [
              {
                'name' => 'from',
                'language' => 'sql',
                'children' => {
                  'tables' => [
                    {
                      'name' => 'tableIntroduction',
                      'language' => 'sql',
                      'properties' => {
                        'name' => 'key_value'
                      }
                    }
                  ]
                }
              }
            ],
            'where' => [
              {
                'name' => 'where',
                'language' => 'sql',
                'children' => {
                  'expressions' => [
                    {
                      'name' => 'binaryExpression',
                      'language' => 'sql',
                      'children' => {
                        'lhs' => [
                          {
                            'name' => 'columnName',
                            'language' => 'sql',
                            'properties' => {
                              'columnName' => 'key',
                              'refTableName' => 'key_value'
                            }
                          }
                        ],
                        'rhs' => [
                          {
                            'name' => 'constant',
                            'language' => 'sql',
                            'properties' => {
                              'value' => '3'
                            }
                          }
                        ],
                        'operator' => [
                          {
                            'name' => 'relationalOperator',
                            'language' => 'sql',
                            'properties' => {
                              'operator' => '>='
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ],
            'select' => [
              {
                'name' => 'select',
                'language' => 'sql',
                'children' => {
                  'columns' => [
                    {
                      'name' => 'columnName',
                      'language' => 'sql',
                      'properties' => {
                        'columnName' => 'key',
                        'refTableName' => 'key_value'
                      }
                    },
                    {
                      'name' => 'columnName',
                      'language' => 'sql',
                      'properties' => {
                        'columnName' => 'value',
                        'refTableName' => 'key_value'
                      }
                    },
                    {
                      'name' => 'starOperator',
                      'language' => 'sql'
                    }
                  ]
                }
              }
            ],
            'groupBy' => []
          }
        }
      end
    end
  end
end
