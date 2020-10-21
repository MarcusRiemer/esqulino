FactoryBot.define do
  factory :grammar do
    name { "Spec Grammar" }
    sequence (:slug) { |n| "grammar-#{n}" }
    association :programming_language
    types { Hash.new }
    foreign_types { Hash.new }

    # A grammar that has a single type that is the root
    trait :model_single_type do
      types {
        {
          "spec" => {
            "root" => {
              "type" => "concrete",
              "attributes" => []
            }
          }
        }
      }
      root {
        {
          "languageName" => "spec",
          "typeName" => "root"
        }
      }
    end

    # A grammar that is generated from a code resource
    trait :generated_model_single_type do
      association :generated_from, factory: [:code_resource, :grammar_single_type]
    end

    # A copied version of the MetaGrammar, kept in sync manually
    trait :model_meta do
      root {
        {
          languageName: "MetaGrammar",
          typeName: "grammar"
        }
      }
      types {
        {
          "MetaGrammar" => {
            "node" => {
              "type" => "oneOf",
              "oneOf" => [
                "concreteNode",
                "typedef"
              ]
            },
            "comment" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "tags" => [
                    "comment"
                  ],
                  "type" => "container",
                  "children" => [
                    {
                      "tags" => [
                        "space-after"
                      ],
                      "type" => "terminal",
                      "symbol" => "//"
                    },
                    {
                      "base" => "string",
                      "name" => "text",
                      "type" => "property"
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            },
            "grammar" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "type" => "container",
                      "children" => [
                        {
                          "tags" => [
                            "space-after",
                            "keyword"
                          ],
                          "type" => "terminal",
                          "symbol" => "grammar"
                        },
                        {
                          "base" => "string",
                          "name" => "name",
                          "tags" => [
                            "double-quote",
                            "space-after"
                          ],
                          "type" => "property"
                        },
                        {
                          "name" => "includes",
                          "type" => "sequence",
                          "nodeTypes" => [
                            {
                              "occurs" => "?",
                              "nodeType" => "grammarIncludes"
                            }
                          ]
                        },
                        {
                          "type" => "terminal",
                          "symbol" => "{"
                        }
                      ],
                      "orientation" => "horizontal"
                    },
                    {
                      "tags" => [
                        "indent"
                      ],
                      "type" => "container",
                      "children" => [
                        {
                          "type" => "container",
                          "children" => [
                            {
                              "tags" => [
                                "space-after",
                                "keyword"
                              ],
                              "type" => "terminal",
                              "symbol" => "root"
                            },
                            {
                              "tags" => [
                                "space-after"
                              ],
                              "type" => "terminal",
                              "symbol" => "="
                            },
                            {
                              "name" => "root",
                              "type" => "sequence",
                              "nodeTypes" => [
                                "nodeRef"
                              ]
                            }
                          ],
                          "orientation" => "horizontal"
                        },
                        {
                          "name" => "nodes",
                          "type" => "allowed",
                          "nodeTypes" => [
                            {
                              "occurs" => "+",
                              "nodeType" => "node"
                            },
                            {
                              "occurs" => "*",
                              "nodeType" => "comment"
                            }
                          ]
                        }
                      ],
                      "orientation" => "vertical"
                    },
                    {
                      "type" => "terminal",
                      "symbol" => "}"
                    }
                  ],
                  "orientation" => "vertical"
                }
              ]
            },
            "nodeRef" => {
              "type" => "oneOf",
              "oneOf" => [
                "nodeRefOne",
                "nodeRefCardinality"
              ]
            },
            "typedef" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "tags" => [
                        "space-after",
                        "keyword"
                      ],
                      "type" => "terminal",
                      "symbol" => "typedef"
                    },
                    {
                      "base" => "string",
                      "name" => "languageName",
                      "tags" => [
                        "double-quote"
                      ],
                      "type" => "property"
                    },
                    {
                      "type" => "terminal",
                      "symbol" => "."
                    },
                    {
                      "base" => "string",
                      "name" => "typeName",
                      "tags" => [
                        "double-quote",
                        "space-after"
                      ],
                      "type" => "property"
                    },
                    {
                      "tags" => [
                        "space-after"
                      ],
                      "type" => "terminal",
                      "symbol" => " =>:="
                    },
                    {
                      "tags" => [
                        "allow-wrap"
                      ],
                      "type" => "container",
                      "children" => [
                        {
                          "name" => "references",
                          "type" => "sequence",
                          "between" => {
                            "tags" => [
                              "space-around"
                            ],
                            "type" => "terminal",
                            "symbol" => "|"
                          },
                          "nodeTypes" => [
                            {
                              "occurs" => "*",
                              "nodeType" => "nodeRef"
                            }
                          ]
                        }
                      ],
                      "orientation" => "horizontal"
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            },
            "children" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "tags" => [
                        "space-after",
                        "keyword"
                      ],
                      "type" => "terminal",
                      "symbol" => "children"
                    },
                    {
                      "base" => "string",
                      "name" => "base",
                      "tags" => [
                        "space-after"
                      ],
                      "type" => "property",
                      "restrictions" => [
                        {
                          "type" => "enum",
                          "value" => [
                            "sequence",
                            "allowed"
                          ]
                        }
                      ]
                    },
                    {
                      "base" => "string",
                      "name" => "name",
                      "tags" => [
                        "space-after"
                      ],
                      "type" => "property"
                    },
                    {
                      "tags" => [
                        "space-after"
                      ],
                      "type" => "terminal",
                      "symbol" => " =>:="
                    },
                    {
                      "name" => "references",
                      "type" => "sequence",
                      "nodeTypes" => [
                        {
                          "occurs" => "*",
                          "nodeType" => "nodeRef"
                        }
                      ]
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            },
            "property" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "tags" => [
                        "space-after",
                        "keyword"
                      ],
                      "type" => "terminal",
                      "symbol" => "prop"
                    },
                    {
                      "base" => "string",
                      "name" => "name",
                      "tags" => [
                        "double-quote",
                        "space-after"
                      ],
                      "type" => "property"
                    },
                    {
                      "base" => "string",
                      "name" => "base",
                      "type" => "property",
                      "restrictions" => [
                        {
                          "type" => "enum",
                          "value" => [
                            "integer",
                            "string",
                            "boolean"
                          ]
                        }
                      ]
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            },
            "terminal" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "base" => "string",
                  "name" => "symbol",
                  "tags" => [
                    "double-quote"
                  ],
                  "type" => "property"
                }
              ]
            },
            "attribute" => {
              "type" => "oneOf",
              "oneOf" => [
                "terminal",
                "property",
                "children",
                "container"
              ]
            },
            "container" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "type" => "container",
                      "children" => [
                        {
                          "tags" => [
                            "space-after",
                            "keyword"
                          ],
                          "type" => "terminal",
                          "symbol" => "container"
                        },
                        {
                          "name" => "orientation",
                          "tags" => [
                            "space-after"
                          ],
                          "type" => "sequence",
                          "nodeTypes" => [
                            {
                              "occurs" => "1",
                              "nodeType" => "orientation"
                            }
                          ]
                        },
                        {
                          "type" => "terminal",
                          "symbol" => "{"
                        }
                      ],
                      "orientation" => "horizontal"
                    },
                    {
                      "tags" => [
                        "indent"
                      ],
                      "type" => "container",
                      "children" => [
                        {
                          "name" => "attributes",
                          "type" => "allowed",
                          "nodeTypes" => [
                            {
                              "occurs" => "*",
                              "nodeType" => "attribute"
                            },
                            {
                              "occurs" => "*",
                              "nodeType" => "comment"
                            }
                          ]
                        }
                      ],
                      "orientation" => "vertical"
                    },
                    {
                      "type" => "terminal",
                      "symbol" => "}"
                    }
                  ],
                  "orientation" => "vertical"
                }
              ]
            },
            "grammarRef" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "base" => "string",
                  "name" => "grammarId",
                  "type" => "property"
                }
              ]
            },
            "nodeRefOne" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "base" => "string",
                      "name" => "languageName",
                      "type" => "property"
                    },
                    {
                      "type" => "terminal",
                      "symbol" => "."
                    },
                    {
                      "base" => "string",
                      "name" => "typeName",
                      "type" => "property"
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            },
            "cardinality" => {
              "type" => "oneOf",
              "oneOf" => [
                "knownCardinality"
              ]
            },
            "orientation" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "base" => "string",
                  "name" => "orientation",
                  "type" => "property",
                  "restrictions" => [
                    {
                      "type" => "enum",
                      "value" => [
                        "horizontal",
                        "vertical"
                      ]
                    }
                  ]
                }
              ]
            },
            "concreteNode" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "type" => "container",
                      "children" => [
                        {
                          "tags" => [
                            "space-after",
                            "keyword"
                          ],
                          "type" => "terminal",
                          "symbol" => "node"
                        },
                        {
                          "base" => "string",
                          "name" => "languageName",
                          "tags" => [
                            "double-quote"
                          ],
                          "type" => "property"
                        },
                        {
                          "type" => "terminal",
                          "symbol" => "."
                        },
                        {
                          "base" => "string",
                          "name" => "typeName",
                          "tags" => [
                            "double-quote",
                            "space-after"
                          ],
                          "type" => "property"
                        },
                        {
                          "type" => "terminal",
                          "symbol" => "{"
                        }
                      ],
                      "orientation" => "horizontal"
                    },
                    {
                      "tags" => [
                        "indent"
                      ],
                      "type" => "container",
                      "children" => [
                        {
                          "name" => "attributes",
                          "type" => "allowed",
                          "nodeTypes" => [
                            {
                              "occurs" => "*",
                              "nodeType" => "attribute"
                            },
                            {
                              "occurs" => "*",
                              "nodeType" => "comment"
                            }
                          ]
                        }
                      ],
                      "orientation" => "vertical"
                    },
                    {
                      "type" => "terminal",
                      "symbol" => "}"
                    }
                  ],
                  "orientation" => "vertical"
                }
              ]
            },
            "grammarIncludes" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "tags" => [
                    "space-after",
                    "keyword"
                  ],
                  "type" => "terminal",
                  "symbol" => "includes"
                },
                {
                  "name" => "includes",
                  "type" => "sequence",
                  "nodeTypes" => [
                    {
                      "occurs" => "1",
                      "nodeType" => "grammarRef"
                    }
                  ]
                }
              ]
            },
            "knownCardinality" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "base" => "string",
                  "name" => "cardinality",
                  "type" => "property",
                  "restrictions" => [
                    {
                      "type" => "enum",
                      "value" => [
                        "*",
                        "?",
                        "+"
                      ]
                    }
                  ]
                }
              ]
            },
            "nodeRefCardinality" => {
              "type" => "concrete",
              "attributes" => [
                {
                  "type" => "container",
                  "children" => [
                    {
                      "name" => "references",
                      "type" => "sequence",
                      "nodeTypes" => [
                        {
                          "occurs" => "1",
                          "nodeType" => "nodeRef"
                        }
                      ]
                    },
                    {
                      "name" => "cardinality",
                      "type" => "sequence",
                      "nodeTypes" => [
                        {
                          "occurs" => "1",
                          "nodeType" => "cardinality"
                        }
                      ]
                    }
                  ],
                  "orientation" => "horizontal"
                }
              ]
            }
          }
        }
      }
    end

    # A toy grammar for code resource references
    trait :model_spec_code_resource_references do
      types {
        {
          l: {
            r: {
              type: "concrete",
              attributes: [
                {
                  type: "property",
                  base: "codeResourceReference",
                  name: "ref1",
                },
                {
                  type: "property",
                  base: "codeResourceReference",
                  name: "ref2",
                  isOptional: true,
                },
                {
                  type: "sequence",
                  name: "c",
                  nodeTypes: [
                    {
                      nodeType: "r",
                      occurs: "*",
                    }
                  ]
                }
              ]
            }
          }
        }
      }
      root {
        { languageName: "l", typeName: "r" }
      }
    end
  end
end
