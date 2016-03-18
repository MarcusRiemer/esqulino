require "./project.rb"

require "test/unit"
require "json"

# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class TestEventsProject < Test::Unit::TestCase
  @@events_path = "../data/dev/events/"

  
  def test_describe_events_schema
    schema = database_describe_schema @@events_path

    assert_equal(2, schema.count)

    table_person = schema[schema.index { |v| v.name == "person" }]
    column_person_id = table_person[0]
    assert_equal("person_id", column_person_id.name)
    assert_equal("INTEGER", column_person_id.type)
    assert_equal(true, column_person_id.not_null)
    assert_nil(column_person_id.dflt_value)
    assert_equal(true, column_person_id.primary)

    column_person_name = table_person[1]
    assert_equal("vorname", column_person_name.name)
    assert_equal("TEXT", column_person_name.type)
    assert_equal(true, column_person_name.not_null)
    assert_nil(column_person_name.dflt_value)
    assert_equal(false, column_person_name.primary)

    column_person_geb_dat = table_person[2]
    assert_equal("nachname", column_person_geb_dat.name)
    assert_equal("TEXT", column_person_geb_dat.type)
    assert_equal(true, column_person_geb_dat.not_null)
    assert_nil(column_person_geb_dat.dflt_value)
    assert_equal(false, column_person_geb_dat.primary)
  end

  def test_query_events_person
    queries = project_load_queries @@events_path
  end
 
end
