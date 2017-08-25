require 'test_helper'

class SqlGuessworkTest < ActionDispatch::IntegrationTest
  test "first_from_tablename" do
    assert 'foo', SqlAccessor::first_from_tablename("SELECT * FROM foo")
    assert 'foo', SqlAccessor::first_from_tablename("SELECT *\nFROM foo WHERE 1 = 2")
    assert 'foo', SqlAccessor::first_from_tablename("SELECT *\nFROM foo,bar WHERE 1 = 2")
  end

  test "insert_tablename" do
    assert 'foo', SqlAccessor::insert_tablename("INSERT INTO foo VALUES(1,2,3)")
    assert 'foo', SqlAccessor::insert_tablename("INSERT INTO foo\nVALUES(1,2,3)")
  end
end
