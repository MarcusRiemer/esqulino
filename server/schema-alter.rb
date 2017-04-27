# coding: utf-8
require_relative './schema'
require_relative './schema-utils'

require 'sqlite3'
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
          switchColumn(table, cmd['indexOrder'])
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
        when "addForeignKey"
          addForeignKey(table, cmd['newForeignKey'])
        when "removeForeignKey"
          removeForeignKey(table, cmd['foreignKeyToRemove'])
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
    db = sqlite_open_augmented(sqlite_file_path)
    db.execute("PRAGMA foreign_keys = OFF;")

    db.transaction
    db.execute("ALTER TABLE #{schema_table.name} RENAME TO #{tempTableName};")
    db.execute(table_to_create_statement(schema_table))
    

    colFrom, colTo = create_column_strings(colHash)
    db.execute("INSERT INTO #{schema_table.name}(#{colTo}) SELECT #{colFrom} FROM #{tempTableName};")

    db.execute("DROP TABLE #{tempTableName};")

    error, consistencyBreaks = check_consistency(db)

    db.execute("PRAGMA foreign_keys = ON;")
    if error == 0
      db.commit()
      db.close()
      return 0
    else
      db.close()
      return 2, consistencyBreaks
    end
  rescue SQLite3::ConstraintException => e
    db.close()
    return 1, e.message
  end
end

def check_consistency(db)
  begin
    db.foreign_key_check()
  rescue SQLite3::SQLException => e
    return 1, e.message
  end
    return 0
end

def remove_table(sqlite_file_path, tableName)
  db = sqlite_open_augmented(sqlite_file_path)
  db.execute("PRAGMA foreign_keys = ON;")
  begin
    db.execute("DROP TABLE IF EXISTS #{tableName}")
  rescue SQLite3::ConstraintException => e
    db.close
    return 1, e.message
  end
    return 0
end

def create_table(sqlite_file_path, newTable)
  db = sqlite_open_augmented(sqlite_file_path)
  db.execute("PRAGMA foreign_keys = ON;")
  begin
    db.execute(table_to_create_statement(newTable))
  rescue Exception => e
    puts e.class
    db.close
    return 1, e.message
  end
    return 0
end

def rename_table(sqlite_file_path, from_tableName, to_tableName) 
  begin
    db = SQLite3::Database.open(sqlite_file_path)
    db.execute("PRAGMA foreign_keys = ON")

    #Muss in der Datei stehen wo es auch ausgelöst werden kann?????
    db.create_function('regexp', 2) do |func, pattern, expression|
        unless expression.nil?
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
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type boolean' CHECK (#{schema_column.name} == 1 or #{schema_column.name} == 0) ")
  elsif schema_column.type == 'INTEGER'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type integer' CHECK (#{schema_column.name} regexp '^[+-]?[0-9]+$') ")
  elsif schema_column.type == 'FLOAT'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type float' CHECK (#{schema_column.name} regexp '^[+-]?([0-9]*\.[0-9]+$|[0-9]+$)') ")
  elsif schema_column.type == 'URL'
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
    createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type url' CHECK (#{schema_column.name} regexp '#\b(([\w-]+://?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/)))#iS') ")
  else
    createStatement.concat(schema_column.type)
    createStatement.concat(" ")
  end
  if schema_column.not_null || schema_column.primary
    createStatement.concat("NOT NULL ")
  end
  unless schema_column.dflt_value.nil?
    createStatement.concat("DEFAULT #{schema_column.dflt_value}")
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
  colHash.delete(table.columns.find{|col| col.index == columnIndex}.name)
  table.foreign_keys.each do |fk|
    fk.references.select!{ |ref| ref.from_column != table.columns.find{|col| col.index == columnIndex}.name }
  end
  table.foreign_keys.select!{ |fk| fk.references.size != 0 }
  table.columns.delete(table.columns.find{|col| col.index == columnIndex})
end

def switchColumn(table, columnOrder)
  table.columns = columnOrder.map{|col| table.columns.find{|tcol| tcol.index == col}}
end

def renameColumn(table, colHash, columnIndex, newName)
  colHash[table.columns.find{|col| col.index == columnIndex}.name] = newName
  table.columns.find{|col| col.index == columnIndex}.name = newName
end

def changeColumnType(table, columnIndex, newType)
  table.columns.find{|col| col.index == columnIndex}.type = newType
end

def changeColumnPrimaryKey(table, columnIndex)
  table.columns.find{|col| col.index == columnIndex}.primary = !table.columns.find{|col| col.index == columnIndex}.primary
end

def changeColumnNotNull(table, columnIndex)
  table.columns.find{|col| col.index == columnIndex}.not_null = !table.columns.find{|col| col.index == columnIndex}.not_null
end

def changeColumnStandardValue(table, columnIndex, newValue)
  table.columns.find{|col| col.index == columnIndex}.dflt_value = newValue
end

def changeTableName(table, newName)
  table.name = newName
end

def addForeignKey(table, foreignKey)
  foreign_key_comp = SchemaForeignKey.new()
  foreignKey['refs'].each do |fk|
    foreign_key_ref = SchemaForeignKeyRef.new(fk['from_column'], fk['to_table'], fk['to_column'])
    foreign_key_comp.add_foreign_key(foreign_key_ref)
  end
  table.add_foreign_keys(foreign_key_comp)  
end

def removeForeignKey(table, foreignKey)
  refToDelete = nil;
  foreign_key_comp = SchemaForeignKey.new()
  foreignKey['refs'].each do |fk|
    foreign_key_ref = SchemaForeignKeyRef.new(fk['from_column'], fk['to_table'], fk['to_column'])
    foreign_key_comp.add_foreign_key(foreign_key_ref)
  end
  table.foreign_keys.each do |ref|
    if ref.to_json(nil) == foreign_key_comp.to_json(nil)
      refToDelete = ref
    end
  end
  table.foreign_keys.delete(refToDelete)
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
