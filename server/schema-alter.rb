require_relative './schema'

def database_alter_schema(sqlite_file_path, schema_table, isSpecialCase)
  tempTableName = String.new(schema_table.name)
  tempTableName.concat('_oldTable')
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
  #TODO: Insert now only for operation not changing columns number/order
  if isSpecialCase
    colNames = String.new((schema_table.columns.map{|col| col.name}).join(','))
    db.execute("INSERT INTO #{schema_table.name}(#{colNames}) SELECT #{colNames} FROM #{tempTableName};")    
  else
    db.execute("INSERT INTO #{schema_table.name} SELECT * FROM #{tempTableName};")
  end
  db.execute("DROP TABLE #{tempTableName};")
  #TODO: Use to check for errors
  db.execute("PRAGMA foreign_key_check;")
  db.commit()
  db.execute("PRAGMA foreign_keys = ON;")
  db.close()
end


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
  if schema_column.not_null
    createStatement.concat("NOT NULL ")
  end
  unless schema_column.dflt_value.nil?
    createStatement.concat("DEFAULT '#{schema_column.dflt_value}'")
  end
  return createStatement
end

if __FILE__ == $0
  puts (database_alter_schema ARGV[0])
end
