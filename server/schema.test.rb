require './schema.rb'

require 'tempfile'
require 'test/unit'

# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class Database < Test::Unit::TestCase

  def assert_column(schema, table_idx, col_idx, name, type)
    column = schema[table_idx].columns[col_idx]
    assert_equal column.name, name
    assert_equal column.type, type
  end
  
  def test_created_schema
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    puts "Test #{temp_db_file.path}"
    
    db.execute <<-delim
      create table students (
        name TEXT,
        email TEXT,  
        grade INTEGER,
        blog URL
      );
    delim
    
    db.close

    schema = database_describe_schema(temp_db_file.path)
    
    assert_equal schema[0].name, "students"
    assert_column schema, 0, 0, 'name', 'TEXT'
    assert_column schema, 0, 1, 'email', 'TEXT'
    assert_column schema, 0, 2, 'grade', 'INTEGER'
    assert_column schema, 0, 3, 'blog', 'URL'
  end
end
