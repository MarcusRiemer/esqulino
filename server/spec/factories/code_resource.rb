FactoryBot.define do
  factory :code_resource, class: CodeResource do
    name "Spec Code Resource"
    association :project, factory: :project
    association :block_language, factory: :block_language
    association :programming_language, factory: :programming_language

    # Projects allow or disallow block languages. We need to ensure
    # that the created block language is allowed by the project
    after(:build) do |code_resource|
      if (code_resource.project and code_resource.block_language) then
        code_resource.project.block_languages << code_resource.block_language
      end
    end

    trait :sql_key_value_select_double do |query|
      query.ast ({
                   "name"=> "querySelect",
                   "language"=> "sql",
                   "children"=> {
                     "from"=> [
                       {
                         "name"=> "from",
                         "language"=> "sql",
                         "children"=> {
                           "tables"=> [
                             {
                               "name"=> "tableIntroduction",
                               "language"=> "sql",
                               "properties"=> {
                                 "name"=> "key_value"
                               }
                             }
                           ]
                         }
                       }
                     ],
                     "where"=> [
                       {
                         "name"=> "where",
                         "language"=> "sql",
                         "children"=> {
                           "expressions"=> [
                             {
                               "name"=> "binaryExpression",
                               "language"=> "sql",
                               "children"=> {
                                 "lhs"=> [
                                   {
                                     "name"=> "columnName",
                                     "language"=> "sql",
                                     "properties"=> {
                                       "columnName"=> "key",
                                       "refTableName"=> "key_value"
                                     }
                                   }
                                 ],
                                 "rhs"=> [
                                   {
                                     "name"=> "constant",
                                     "language"=> "sql",
                                     "properties"=> {
                                       "value"=> "3"
                                     }
                                   }
                                 ],
                                 "operator"=> [
                                   {
                                     "name"=> "relationalOperator",
                                     "language"=> "sql",
                                     "properties"=> {
                                       "operator"=> ">="
                                     }
                                   }
                                 ]
                               }
                             }
                           ]
                         }
                       }
                     ],
                     "select"=> [
                       {
                         "name"=> "select",
                         "language"=> "sql",
                         "children"=> {
                           "columns"=> [
                             {
                               "name"=> "columnName",
                               "language"=> "sql",
                               "properties"=> {
                                 "columnName"=> "key",
                                 "refTableName"=> "key_value"
                               }
                             },
                             {
                               "name"=> "columnName",
                               "language"=> "sql",
                               "properties"=> {
                                 "columnName"=> "value",
                                 "refTableName"=> "key_value"
                               }
                             },
                             {
                               "name"=> "starOperator",
                               "language"=> "sql"
                             }
                           ]
                         }
                       }
                     ],
                     "groupBy"=> []
                   }
                 })
    end
  end
end
