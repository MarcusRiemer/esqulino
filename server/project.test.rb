require "./project.rb"

require "test/unit"
require "json"

# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class Database < Test::Unit::TestCase
  @@project_path = "../data/dev/test/"

  # Ensures the database description is correct
  def test_database_describe_schema
    schema = database_describe_schema @@project_path

    assert_equal(1, schema.count)

    table_key_value = schema[schema.index { |v| v.name == "key_value" }]

    column_key = table_key_value[0]
    assert_equal("key", column_key.name)
    assert_equal("INTEGER", column_key.type)
    assert_equal(true, column_key.not_null)
    assert_nil(column_key.dflt_value)
    assert_equal(true, column_key.primary)

    column_value = table_key_value[1]
    assert_equal("value", column_value.name)
    assert_equal("TEXT", column_value.type)
    assert_equal(true, column_value.not_null)
    assert_nil(column_value.dflt_value)
    assert_equal(false, column_value.primary)
  end
end

# Tests all aspect of project creation and modification
class Project < Test::Unit::TestCase
  @@project_path = "../data/dev/test/"

  # Ensures new queries can be created
  def test_project_create_query
    table_name = "key_value"
    query = project_create_query(@@project_path, table_name)

    # Ensure name and id
    assert_equal("Neue Abfrage", query["model"]["name"])
    assert_match(/\A[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}\z/i, query["model"]["id"], "ID must be in UUID format")

    # Ensure "SELECT *"
    model_select = query["model"]["select"]
    assert(model_select["columns"].empty?)
    assert(model_select["allData"])

    # Ensure "FROM key_value"
    model_from_first = query["model"]["from"]["first"]
    assert_equal(table_name, model_from_first["name"])
    
  end
  
end

