require 'test_helper'

class SqlAccessorTest < ActionDispatch::IntegrationTest
  test "first_from_tablename" do
    assert 'foo', SqlAccessor::first_from_tablename("SELECT * FROM foo")
    assert 'foo', SqlAccessor::first_from_tablename("SELECT *\nFROM foo WHERE 1 = 2")
    assert 'foo', SqlAccessor::first_from_tablename("SELECT *\nFROM foo,bar WHERE 1 = 2")
  end

  test "insert_tablename" do
    assert 'foo', SqlAccessor::insert_tablename("INSERT INTO foo VALUES(1,2,3)")
    assert 'foo', SqlAccessor::insert_tablename("INSERT INTO foo\nVALUES(1,2,3)")
  end

  test "where_whole" do
    assert '1', SqlAccessor::where_whole("SELECT *\nFROM foo\nWHERE 1")
    assert '1', SqlAccessor::where_whole("DELETE\nFROM foo\nWHERE 1")
    assert 'foo = "bar"', SqlAccessor::where_whole("DELETE\nFROM foo\nWHERE foo = \"bar\"")
    assert "foo = \"bar\"\nAND 1", SqlAccessor::where_whole("DELETE\nFROM foo\nWHERE foo = \"bar\"\nAND 1")
    assert "foo = \"bar\"\nAND 1", SqlAccessor::where_whole("DELETE\nFROM foo\nWHERE foo = \"bar\"\nAND 1 ORDER BY 2")
  end
end
