require "./schema.rb"

require "test/unit"


# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class Database < Test::Unit::TestCase
  @@sqlite_test_path = "../data/dev/projects/test/databases/default.sqlite"

  # Ensures the database description is correct
  def test_database_describe_schema
    schema = database_describe_schema @@sqlite_test_path

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
