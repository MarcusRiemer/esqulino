require './schema.rb'

require 'tempfile'
require 'test/unit'


# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class Database < Test::Unit::TestCase
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
    
    assert_true schema[0].name == "students"
    assert_true schema[0].columns[0].name == "name"
    assert_true schema[0].columns[0].type == "TEXT"
    assert_true schema[0].columns[1].name == "email"
    assert_true schema[0].columns[1].type == "TEXT"
    assert_true schema[0].columns[2].name == "grade"
    assert_true schema[0].columns[2].type == "INTEGER"
    assert_true schema[0].columns[3].name == "blog"
    assert_true schema[0].columns[3].type == "URL"
  end
end
