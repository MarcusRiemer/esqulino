require_relative './schema'
require 'fileutils'
require 'ostruct'
require 'json'


def database_alter_schema(sqlite_file_path, tableName, commandHolder)
  #copy Database
  FileUtils.cp(sqlite_file_path, sqlite_file_path + '.bak')

  index = 0

  #get Table object out of Database
  table = database_describe_schema(sqlite_file_path).select{ |table| table.name == tableName}.first
  begin
    commandHolder.each do |cmd|
      index = cmd['index']
      colHash = createColumnHash(table)
      if cmd['type'] != "renameTable"
        case cmd['type']
        when "addColumn"
          addColumn(table)
        when "deleteColumn"
          deleteColumn(table, colHash, cmd['columnIndex'])
        when "switchColumn"
          switchColumn(table, cmd['from'], cmd['to'].to_i)
        when "renameColumn"
          renameColumn(table, colHash, cmd['columnIndex'], cmd['newName'])
        when "changeColumnType"
          changeColumnType(table, cmd['columnIndex'], cmd['newType'])
        when "changeColumnPrimaryKey"
          changeColumnPrimaryKey(table, cmd['columnIndex'])
        when "changeColumnNotNull"
          changeColumnNotNull(table, cmd['columnIndex'])
        when "changeColumnStandardValue"
          changeColumnStandardValue(table, cmd['columnIndex'], cmd['newValue'])
        end
        errorCode, errorBody = database_alter_table(sqlite_file_path, table, colHash)
      else
        rename_table(sqlite_file_path, table.name, cmd['newName'])
        errorCode, errorBody = changeTableName(table, cmd['newName'])
      end
      if(errorCode != 0)
        FileUtils.remove_file(sqlite_file_path)
        File.rename(sqlite_file_path + '.bak', sqlite_file_path)
        return true, index, errorCode, errorBody 
      end 
    end
  end
  FileUtils.remove_file(sqlite_file_path + '.bak')
  return false
end


def database_alter_table(sqlite_file_path, schema_table, colHash)
  tempTableName = String.new(schema_table.name)
  tempTableName.concat('_oldTable')
  begin
    db = SQLite3::Database.open(sqlite_file_path)

    #Muss in der Datei stehen wo es auch ausgelöst werden kann?????
    db.create_function('regexp', 2) do |func, pattern, expression|
        unless expression.nil? #expression.to_s.empty?
          func.result = expression.to_s.match(
            Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
        else
          # Return true if the value is null, let the DB handle this
          func.result = 1
        end   
      end

    db.execute("PRAGMA foreign_keys = OFF;")
    db.transaction
    db.execute("ALTER TABLE #{schema_table.name} RENAME TO #{tempTableName};")
    db.execute(table_to_create_statement(schema_table))
    

    colFrom, colTo = create_column_strings(colHash)
    db.execute("INSERT INTO #{schema_table.name}(#{colTo}) SELECT #{colFrom} FROM #{tempTableName};")


    db.execute("DROP TABLE #{tempTableName};")
    #TODO: Use to check for errors
    consistencyErrors = db.execute("PRAGMA foreign_key_check;")
    if(consistencyErrors.length != 0)
      db.close()
      return 2, consistencyErrors
    end
    db.execute("PRAGMA foreign_keys = ON;")
    db.commit()
    db.close()
    return 0
  rescue Exception => e
    db.close()
    return 1, e.message
  end
end

def rename_table(sqlite_file_path, from_tableName, to_tableName) 
  begin
    db = SQLite3::Database.open(sqlite_file_path)
    db.execute("PRAGMA foreign_keys = ON")

    #Muss in der Datei stehen wo es auch ausgelöst werden kann?????
    db.create_function('regexp', 2) do |func, pattern, expression|
        unless expression.nil? #expression.to_s.empty?
          func.result = expression.to_s.match(
            Regexp.new(pattern.to_s, Regexp::IGNORECASE)) ? 1 : 0
        else
          # Return true if the value is null, let the DB handle this
          func.result = 1
        end   
      end

    db.transaction
    db.execute("ALTER TABLE #{from_tableName} RENAME TO #{to_tableName};")
    db.commit()
    db.close()
    return 0
  rescue Exception => e
    db.close()
    return 1, e.message
  end
end

# Function to convert the column hash to two strings 
def create_column_strings(colHash)
  colFrom = String.new()
  colTo = String.new()
  colHash.each_with_index { |(key,value), index|
    colFrom.concat(key)
    colTo.concat(value)
    if index != colHash.length - 1
      colFrom.concat(', ')
      colTo.concat(', ')
    else
      colFrom.concat(' ')
      colTo.concat(' ')
    end
  }
  return colFrom, colTo
end


# Function to create a CREATE TABLE statement out of a schemaTable object.
# @param schema_table - Table object to create a CREATE TABLE statement
# return - The CREATE TABLE statement
def table_to_create_statement(schema_table)
  createStatement = String.new("CREATE TABLE IF NOT EXISTS #{schema_table.name} ( ")
  schema_table.columns.each do |col|
    createStatement.concat(column_to_create_statement(col))
    if schema_table.columns.last != col
      createStatement.concat(", ")
    end
  end
  # create fk constraints
  schema_table.foreign_keys.each do |fk|
    createStatement.concat(", ")
    createStatement.concat(tables_foreignKey_to_create_statement(fk))
  end
  # create PK constraints
  createStatement.concat(tables_primaryKeys_to_create_statement(schema_table.columns))

  createStatement.concat(");")
  return createStatement
end

# Function to create a the primary key constraint part of a CREATE TABLE statement 
# out of a schemaTable object.
# @param schema_table - Table object to create a CREATE TABLE statement
# return - The CREATE TABLE statement primary key constraint part
def tables_primaryKeys_to_create_statement(schema_columns)
  all_primaryKeys = schema_columns.select { |column| column.primary}
  unless all_primaryKeys.empty?
    primKeys = String.new("")
    all_primaryKeys.each do |pk|
      primKeys.concat(pk.name)
      if all_primaryKeys.last != pk
        primKeys.concat(", ")
      end
    end
    createStatement = String.new(", PRIMARY KEY(#{primKeys})")
  else 
    return ""
  end
end

# Function to create a the foreign key constraint part of a CREATE TABLE statement 
# out of a schemaTable object.
# @param schema_table - Table object to create a CREATE TABLE statement
# return - The CREATE TABLE statement foreign key constraint part
def tables_foreignKey_to_create_statement(fk)
  fk_columns = String.new("")
  fk_ref_columns = String.new("")
  fk.references.each do |ref|
    fk_columns.concat(ref.from_column)
    fk_ref_columns.concat(ref.to_column)
    if ref != fk.references.last
      fk_columns.concat(", ")
      fk_ref_columns.concat(", ")
    end
  end
  createStatement = String.new("FOREIGN KEY (#{fk_columns}) REFERENCES #{fk.references[0].to_table}(#{fk_ref_columns})")
  return createStatement
end

# Function to create a CREATE TABLE statement part of a column 
# out of a schemaTable object.
# @param schema_table - Table object to create a CREATE TABLE statement
# return - The CREATE TABLE statement column part
def column_to_create_statement(schema_column)
  createStatement = String.new(schema_column.name)
  createStatement.concat(" ")
  if schema_column.type == 'TEXT'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
  elsif schema_column.type == 'BOOLEAN'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type boolean'' CHECK (#{schema_column.name} == 1 or #{schema_column.name} == 0) ")
  elsif schema_column.type == 'INTEGER'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type integer' CHECK (#{schema_column.name} regexp '^[+-]?[0-9]+$') ")
  elsif schema_column.type == 'FLOAT'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type float' CHECK (#{schema_column.name} regexp '^[+-]?([0-9]*\.[0-9]+$|[0-9]+$)') ")
  else
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
  end
  if schema_column.not_null || schema_column.primary
    createStatement.concat("NOT NULL ")
  end
  unless schema_column.dflt_value.nil?
    createStatement.concat("DEFAULT #{schema_column.dflt_value}")
    puts schema_column.dflt_value
  end
  return createStatement
end

# Function to create a SchemaTable class object, out of a json
def createObject(tableDescribtion)
  return JSON.parse(tableDescribtion, object_class: OpenStruct)
end

### Table Commands ###

def addColumn(table)
  column_schema = SchemaColumn.new(table.columns.length,'NewColumn','TEXT', 0, nil, 0)
  table.add_column(column_schema)
end

def deleteColumn(table, colHash, columnIndex)
  colHash.delete(table.columns[columnIndex].name)
  table.foreign_keys.each do |fk|
    fk.references.select!{ |ref| ref.from_column != table.columns[columnIndex].name }
  end
  table.foreign_keys.select!{ |fk| fk.references.size != 0 }
  table.columns.delete(table.columns[columnIndex])
end

def switchColumn(table, columnIndex, to_pos)
  table.columns.insert(to_pos, table.columns.delete(table[columnIndex]))
end

def renameColumn(table, colHash, columnIndex, newName)
  colHash[table.columns[columnIndex].name] = newName
  table.columns[columnIndex].name = newName
end

def changeColumnType(table, columnIndex, newType)
  table.columns[columnIndex].type = newType
end

def changeColumnPrimaryKey(table, columnIndex)
  table.columns[columnIndex].primary = !table.columns[columnIndex].primary
end

def changeColumnNotNull(table, columnIndex)
  table.columns[columnIndex].not_null = !table.columns[columnIndex].not_null
end

def changeColumnStandardValue(table, columnIndex, newValue)
  table.columns[columnIndex].dflt_value = newValue
end

def changeTableName(table, newName)
  table.name = newName
end

def createColumnHash(table)
  colHash = Hash.new
  table.columns.each do |col|
    colHash[col.name] = col.name
  end
  return colHash
end

if __FILE__ == $0
  puts (database_alter_schema ARGV[0])
end
