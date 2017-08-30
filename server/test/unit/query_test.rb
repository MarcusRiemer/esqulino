require 'test_helper'

require_dependency 'query'

class QueryTest < ActiveSupport::TestCase
  test "SELECT Query - Serialization" do
    model = {
      "name" => "kommentar_loeschen",
      "apiVersion" => "3",
      "delete" => {
      },
      "from" => {
        "first" => {
          "name" => "comment"
        }
      },
      "where" => {
        "first" => {
          "binary" => {
            "lhs" => {
              "singleColumn" => {
                "column" => "comment_id",
                "table" => "comment"
              }
            },
            "rhs" => {
              "parameter" => {
                "key" => "kommentar_id"
              }
            },
            "operator" => "=",
            "simple" => true
          }
        }
      }
    }

    q = Query.new(nil, 1, model)

    # Basic model checking
    assert_equal(model['name'], q.name)
    assert_equal(1, q.id)

    
    assert_equal(model, q.model)
  end

  # Ensures the ruby implementation knows how to extract expression leaves.
  test "Query.get_leaves" do
    q1 = Query.new(nil, 2, {
                     "name" => "kommentar_loeschen",
                     "apiVersion" => "3",
                     "delete" => {
                     },
                     "from" => {
                       "first" => {
                         "name" => "comment"
                       }
                     },
                     "where" => {
                       "first" => {
                         "binary" => {
                           "lhs" => {
                             "singleColumn" => {
                               "column" => "comment_id",
                               "table" => "comment"
                             }
                           },
                           "rhs" => {
                             "parameter" => {
                               "key" => "kommentar_id"
                             }
                           },
                           "operator" => "=",
                           "simple" => true
                         }
                       }
                     }
                   })
    assert_equal(2, q1.expression_leaves.length)

    q2 = Query.new(nil, 3, {
                     "name" => "kommentar_loeschen",
                     "apiVersion" => "3",
                     "delete" => {
                     },
                     "from" => {
                       "first" => {
                         "name" => "comment"
                       }
                     }
                   })
    assert_equal(0, q2.expression_leaves.length)

    q3 = Query.new(nil, 3, {
                     "name" => "kommentar_loeschen",
                     "apiVersion" => "3",
                     "delete" => {
                     },
                     "from" => {
                       "first" => {
                         "name" => "comment"
                       }
                     },
                     "where" => {
                       "first" => {
                         "constant" => {
                           "value" => 1
                         }
                       }
                     }
                   })
    assert_equal(1, q3.expression_leaves.length)
  end
end
