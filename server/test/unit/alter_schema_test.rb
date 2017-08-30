require 'tempfile'

require_dependency 'schema'
require_dependency 'schema_alter'

# Not strictly a unit test, as it requires the use of external files.
# But for the moment this is what we will roll with, as this does
# show how the SQLite API behaves.
class AlterSchemaTest < ActiveSupport::TestCase

  def assert_column(schema, table_idx, col_idx, name, type)
    column = schema[table_idx].columns[col_idx]
    assert_equal column.name, name
    assert_equal column.type, type
  end
  
  test "Create Schema" do
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    
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


  # Tests whether the customly enforced database constraints
  # actually work.
  test "Datatype constraings" do
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    
    db.create_function('regexp', 2) do |func, pattern, expression|
      unless expression.nil? #expression.to_s.empty?
        func.result = expression.to_s.match(
          Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
      else
        # Return true if the value is null, let the DB handle this
        func.result = 1
      end   
    end

    db.execute <<-delim
      create table constraint_check (
        text TEXT,
        boolean BOOLEAN CONSTRAINT "ERR: Value is not of type boolean" CHECK (boolean == 1 or boolean == 0),  
        integer INTEGER CONSTRAINT "ERR: Value is not of type integer" CHECK (integer regexp '^[+-]?[0-9]+$'),
        float FLOAT CONSTRAINT "ERR: Value is not of type float" CHECK (float regexp '^[+-]?([0-9]*\.[0-9]+$|[0-9]+$)')
      );
    delim

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, null, null)")
    end

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, null, '', null)")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, 1, null, null)")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, 0, null, null)")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, -2, null)")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, +3213, null)")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, null, '-12.8')")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, null, '18')")
    end

    assert_nothing_raised do
      db.execute("insert into constraint_check values (null, null, null, '+12.7')")
    end

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, 2, null, null)")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type boolean")

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, 'asd', null, null)")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type boolean")

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, null, 'asd', null)")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type integer")

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, null, '123a', null)")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type integer")

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, null, 'a123', null)")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type integer")

    assert_raise SQLite3::ConstraintException  do
      db.execute("insert into constraint_check values (null, null, null, '-12.2g')")
    end

    assert_equal(db.errmsg(), "CHECK constraint failed: ERR: Value is not of type float")

    db.close

    schema = database_describe_schema(temp_db_file.path)
    
    assert_equal schema[0].name, "constraint_check"
    assert_column schema, 0, 0, 'text', 'TEXT'
    assert_column schema, 0, 1, 'boolean', 'BOOLEAN'
    assert_column schema, 0, 2, 'integer', 'INTEGER'
    assert_column schema, 0, 3, 'float', 'FLOAT'
  end


  test "CREATE statement" do
    temp_db_file = Tempfile.new('test.sqlite')
    temp_db_file2 = Tempfile.new('test2.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    db2 = SQLite3::Database.new(temp_db_file2.path)

    db2.create_function('regexp', 2) do |func, pattern, expression|
      unless expression.nil? #expression.to_s.empty?
        func.result = expression.to_s.match(
          Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
      else
        # Return true if the value is null, let the DB handle this
        func.result = 1
      end   
    end
    
    create1 = String.new("create table students (name TEXT NOT NULL, email TEXT DEFAULT blah, grade INTEGER, blog URL, PRIMARY KEY(name, email));")
    create2 = String.new("create table person (id TEXT NOT NULL, id2 TEXT ,FOREIGN KEY (id, id2) REFERENCES students(name, email));")

    db.execute(create1)

    db.execute(create2)
    
    schema = database_describe_schema(temp_db_file.path)
    
    db2.execute(table_to_create_statement(schema[0]))
    db2.execute(table_to_create_statement(schema[1]))

    # Write function to compare two table objects
    #puts (schema[0].columns.map{|col| col.name}).join(',')
    
    db.close
    db2.close
  end

  # test "test_change_database" do
  #   temp_db_file = Tempfile.new('test.sqlite')
  #   db = SQLite3::Database.new(temp_db_file.path)

  #   db.create_function('regexp', 2) do |func, pattern, expression|
  #     unless expression.nil? #expression.to_s.empty?
  #       func.result = expression.to_s.match(
  #         Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
  #     else
  #       # Return true if the value is null, let the DB handle this
  #       func.result = 1
  #     end   
  #   end
  
  #   create1 = String.new("create table students (name TEXT NOT NULL, email TEXT DEFAULT blah, grade INTEGER CONSTRAINT 'ERR: Value is not of type integer' CHECK (grade regexp '^[+-]?[0-9]+$'), blog URL, PRIMARY KEY(name, email));")
  #   db.execute(create1)
  #   db.execute("INSERT INTO students values('dataname', 'datamail', 5, 'blogurl');")
  #   count = db.execute("Select count(*) from students;")
  #   schema = database_describe_schema(temp_db_file.path)
  #   assert_column schema, 0, 2, 'grade', 'INTEGER'
  #   assert_equal([[1]], count)

  #   table = schema[0]

  #   # changing type of grade
  #   database_alter_schema(temp_db_file.path, table.name, [
  #                           {
  #                             'type' => 'changeColumnType',
  #                             'index' => 0,
  #                             'columnIndex' => 2,
  #                             'newType' => 'TEXT',
  #                             'oldType' => 'INTEGER'
  #                           }
  #                         ])

  #   schema = database_describe_schema(temp_db_file.path)
  #   assert_column schema, 0, 2, 'grade', 'TEXT'
  #   assert_equal([[1]], count)
  
  #   # changing type of blog to Integer so the values don't fit in
  #   # there should be an error
  #   assert_raise SQLite3::ConstraintException  do
  #     database_alter_schema(temp_db_file.path, table.name, [
  #                             {
  #                               'type' => 'changeColumnType',
  #                               'index' => 0,
  #                               'columnIndex' => 3,
  #                               'newType' => 'TEXT',
  #                               'oldType' => 'URL'
  #                             }
  #                           ])
  #   end

  #   schema = database_describe_schema(temp_db_file.path)
  #   # the database didn't changed
  #   assert_column schema, 0, 3, 'blog', 'URL'
  #   assert_equal([[1]], count)


  #   db.close
  # end

  test "Table Commands" do
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    
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

    addColumn(schema[0])
    
    assert_equal schema[0].name, "students"
    assert_column schema, 0, 0, 'name', 'TEXT'
    assert_column schema, 0, 1, 'email', 'TEXT'
    assert_column schema, 0, 2, 'grade', 'INTEGER'
    assert_column schema, 0, 3, 'blog', 'URL'
    assert_column schema, 0, 4, 'NewColumn', 'TEXT'

    deleteColumn(schema[0],createColumnHash(schema[0]), 4)
    assert_equal(4, schema[0].columns.length)

    assert_equal schema[0].name, "students"
    assert_column schema, 0, 0, 'name', 'TEXT'
    assert_column schema, 0, 1, 'email', 'TEXT'
    assert_column schema, 0, 2, 'grade', 'INTEGER'
    assert_column schema, 0, 3, 'blog', 'URL'

    # TODO: Signature of switchColumn has changed?
    # switchColumn(schema[0], 0, 1)

    # assert_equal schema[0].name, "students"
    # assert_column schema, 0, 1, 'name', 'TEXT'
    # assert_column schema, 0, 0, 'email', 'TEXT'
    # assert_column schema, 0, 2, 'grade', 'INTEGER'
    # assert_column schema, 0, 3, 'blog', 'URL'

    renameColumn(schema[0], createColumnHash(schema[0]), 0, 'E-Mail')
    assert_column schema, 0, 0, 'E-Mail', 'TEXT'
    
    changeColumnType(schema[0], 0, 'MAIL')
    assert_column schema, 0, 0, 'E-Mail', 'MAIL'

    assert_equal(schema[0].columns[0].primary, false)
    changeColumnPrimaryKey(schema[0], 0)
    assert_equal(schema[0].columns[0].primary, true)
    
    assert_equal(schema[0].columns[0].not_null, false)
    changeColumnNotNull(schema[0], 0)
    assert_equal(schema[0].columns[0].not_null, true)

    assert_nil schema[0].columns[0].dflt_value
    changeColumnStandardValue(schema[0], 0, 'testValue')
    assert_equal(schema[0].columns[0].dflt_value, 'testValue')

    assert_equal schema[0].name, "students"
    changeTableName(schema[0], "students_updated")
    assert_equal schema[0].name, "students_updated"
    
  end

  test "createColumnHash" do
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)

    db.create_function('regexp', 2) do |func, pattern, expression|
      unless expression.nil? #expression.to_s.empty?
        func.result = expression.to_s.match(
          Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
      else
        # Return true if the value is null, let the DB handle this
        func.result = 1
      end   
    end
    
    create1 = String.new("create table students (name TEXT NOT NULL, email TEXT DEFAULT blah, grade INTEGER, blog URL, PRIMARY KEY(name, email));")

    db.execute(create1)
    
    schema = database_describe_schema(temp_db_file.path)

    assert_equal(createColumnHash(schema[0]), {"name"=>"name", "email"=>"email", "grade"=>"grade", "blog"=>"blog"})

    
    db.close
  end


  test "Change Order" do
    temp_db_file = Tempfile.new('test.sqlite')
    db = SQLite3::Database.new(temp_db_file.path)
    
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
    
    table = schema[0]
    order = [3,2,1,0]
    table.columns = order.map{|x| table.columns[x]}
    
    assert_equal schema[0].name, "students"
    assert_column schema, 0, 3, 'name', 'TEXT'
    assert_column schema, 0, 2, 'email', 'TEXT'
    assert_column schema, 0, 1, 'grade', 'INTEGER'
    assert_column schema, 0, 0, 'blog', 'URL'
  end

end
