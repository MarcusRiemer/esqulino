require 'sqlite3'
require 'fileutils'
require 'ostruct'
require 'json'

module SchemaTools
  module Alter
    def self.database_alter_schema(project_database, table_name, commandHolder)
      sqlite_file_path = project_database.sqlite_file_path

      # Just in case: Making a copy of the whole database
      FileUtils.cp(sqlite_file_path, "#{sqlite_file_path}.bak")

      table = SchemaTools.database_describe_schema(sqlite_file_path)
                         .select { |table| table.name == table_name }.first

      # Execute each command one by one
      begin
        commandHolder.each_with_index do |cmd, _index|
          colHash = createColumnHash(table)
          # Rename table can not be expressed via a transformation
          # that is based on the model and is therefore handled seperatly
          if cmd['type'] != 'renameTable'
            case cmd['type']
            when 'addColumn'
              addColumn(table)
            when 'deleteColumn'
              deleteColumn(table, colHash, cmd['columnIndex'])
            when 'switchColumn'
              switchColumn(table, cmd['indexOrder'])
            when 'renameColumn'
              renameColumn(table, colHash, cmd['columnIndex'], cmd['newName'])
            when 'changeColumnType'
              changeColumnType(table, cmd['columnIndex'], cmd['newType'])
            when 'changeColumnPrimaryKey'
              changeColumnPrimaryKey(table, cmd['columnIndex'])
            when 'changeColumnNotNull'
              changeColumnNotNull(table, cmd['columnIndex'])
            when 'changeColumnStandardValue'
              changeColumnStandardValue(table, cmd['columnIndex'], cmd['newValue'])
            when 'addForeignKey'
              addForeignKey(table, cmd['newForeignKey'])
            when 'removeForeignKey'
              removeForeignKey(table, cmd['foreignKeyToRemove'])
            end

            table_hash = table.serializable_hash(include: { columns: {}, foreign_keys: {} })
            database_alter_table(sqlite_file_path, table_hash, colHash)
          else
            internal_rename_table(sqlite_file_path, table.name, cmd['newName'])
            changeTableName(table, cmd['newName'])
          end
        end
      rescue StandardError
        # Something went wrong, move the backup back
        FileUtils.mv("#{sqlite_file_path}.bak", sqlite_file_path)

        raise
        # raise EsqulinoError.new("Internal error altering the database")
      end
    end

    def self.database_alter_table(sqlite_file_path, schema_table, colHash)
      tempTableName = String.new(schema_table['name'])
      tempTableName.concat('_oldTable')

      db = SchemaTools.sqlite_open_augmented(sqlite_file_path)
      db.execute('PRAGMA foreign_keys = OFF;')

      # Rename the altered table to a temporary name and create a new table
      # with the correct structure
      db.transaction
      db.execute("ALTER TABLE #{schema_table['name']} RENAME TO #{tempTableName};")
      db.execute(table_to_create_statement(schema_table))

      # Copy over the data by specifying matching column pairs
      colFrom, colTo = create_column_strings(colHash)
      db.execute("INSERT INTO #{schema_table['name']}(#{colTo}) SELECT #{colFrom} FROM #{tempTableName};")

      # Drop the previous table
      db.execute("DROP TABLE #{tempTableName};")

      # And ensure the database is still consistent
      ensure_consistency!(db)

      db.execute('PRAGMA foreign_keys = ON;')
      db.commit
      db.close
    end

    def self.ensure_consistency!(db)
      raise EsqulinoError, 'Database inconsistent' if db.foreign_key_check.size.positive?
    end

    def self.internal_rename_table(sqlite_file_path, from_tableName, to_tableName)
      db = SchemaTools.sqlite_open_augmented(sqlite_file_path)
      db.execute('PRAGMA foreign_keys = ON')

      db.transaction
      db.execute("ALTER TABLE #{from_tableName} RENAME TO #{to_tableName};")
      db.commit
      db.close
    end

    # Function to convert the column hash to two strings
    def self.create_column_strings(colHash)
      colFrom = ''
      colTo = ''
      colHash.each_with_index do |(key, value), index|
        colFrom.concat(key)
        colTo.concat(value)
        if index != colHash.length - 1
          colFrom.concat(', ')
          colTo.concat(', ')
        else
          colFrom.concat(' ')
          colTo.concat(' ')
        end
      end
      [colFrom, colTo]
    end

    # Function to create a CREATE TABLE statement out of a schemaTable object.
    # @param schema_table - Table object to create a CREATE TABLE statement
    # return - The CREATE TABLE statement
    def self.table_to_create_statement(schema_table)
      createStatement = String.new("CREATE TABLE IF NOT EXISTS #{schema_table['name']} ( ")
      schema_table['columns'].each do |col|
        createStatement.concat(column_to_create_statement(col))
        createStatement.concat(', ') if schema_table['columns'].last != col
      end
      # create fk constraints
      foreign_keys = schema_table['foreignKeys'] || schema_table['foreign_keys']
      foreign_keys.each do |fk|
        createStatement.concat(', ')
        createStatement.concat(tables_foreignKey_to_create_statement(fk))
      end
      # create PK constraints
      createStatement.concat(tables_primaryKeys_to_create_statement(schema_table['columns']))

      createStatement.concat(');')
      createStatement
    end

    # Function to create a the primary key constraint part of a CREATE TABLE statement
    # out of a schemaTable object.
    # @param schema_table - Table object to create a CREATE TABLE statement
    # return - The CREATE TABLE statement primary key constraint part
    def self.tables_primaryKeys_to_create_statement(schema_columns)
      all_primaryKeys = schema_columns.select { |column| column['primary'] }
      return '' if all_primaryKeys.empty?

      primKeys = String.new('')
      all_primaryKeys.each do |pk|
        primKeys.concat(pk['name'])
        primKeys.concat(', ') if all_primaryKeys.last != pk
      end
      String.new(", PRIMARY KEY(#{primKeys})")
    end

    # Function to create a the foreign key constraint part of a CREATE TABLE statement
    # out of a schemaTable object.
    # @param schema_table - Table object to create a CREATE TABLE statement
    # return - The CREATE TABLE statement foreign key constraint part
    def self.tables_foreignKey_to_create_statement(fk)
      # The given references may be "intelligent" instances, but we do
      # expect "dumb" hashes. I am not quite sure where this happens exactly,
      # but thankfully the conversion is simple
      fk_references = fk['references'].map do |ref|
        if ref.is_a? SchemaForeignKeyRef
          ref.instance_values
        else
          ref
        end
      end

      # Collecting the columns and the things they are referencing
      fk_columns = ''
      fk_ref_columns = ''

      fk_references.each_with_index do |ref, i|
        if i.positive?
          fk_columns.concat(', ')
          fk_ref_columns.concat(', ')
        end

        fk_columns.concat(ref['from_column'] || ref['fromColumn'])
        fk_ref_columns.concat(ref['to_column'] || ref['toColumn'])
      end

      target_table = fk_references[0]['to_table'] || fk_references[0]['toTable']
      "FOREIGN KEY (#{fk_columns}) REFERENCES #{target_table}(#{fk_ref_columns})"
    end

    # Function to create a CREATE TABLE statement part of a column
    # out of a schemaTable object.
    # @param schema_table - Table object to create a CREATE TABLE statement
    # return - The CREATE TABLE statement column part
    def self.column_to_create_statement(schema_column)
      createStatement = String.new(schema_column['name'])
      createStatement.concat(' ')
      createStatement.concat(schema_column['type'])
      createStatement.concat(' ')
      case schema_column['type']
      when 'TEXT'
      when 'BOOLEAN'
        createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column['name']})]: Value is not of type boolean' CHECK (#{schema_column['name']} == 1 OR #{schema_column['name']} == 0 OR #{schema_column['name']} IS NULL) ")
      when 'INTEGER'
        createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column['name']})]: Value is not of type integer' CHECK (#{schema_column['name']} REGEXP '^([+-]?[0-9]+$|)') ")
      when 'FLOAT'
        createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column['name']})]: Value is not of type float' CHECK (#{schema_column['name']} regexp '^[+-]?([0-9]*\.[0-9]+$|[0-9]+$)') ")
      when 'URL'
        createStatement.concat("CONSTRAINT 'ERROR[Column(#{schema_column['name']})]: Value is not of type url' CHECK (#{schema_column['name']} REGEXP '#\b(([\w-]+://?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/)))#iS') ")
      end

      createStatement.concat('NOT NULL ') if schema_column['notNull'] || schema_column['not_null'] || schema_column['primary']

      dflt_value = schema_column['dfltValue'] || schema_column['dflt_value']
      createStatement.concat("DEFAULT #{dflt_value}") if dflt_value && !dflt_value.empty?
      createStatement
    end

    # Function to create a SchemaTable class object, out of a json
    def self.createObject(tableDescribtion)
      JSON.parse(tableDescribtion, object_class: OpenStruct)
    end

    def self.replace_refs_in_new_table(tableDescribtion)
      tableDescribtion = JSON.parse(tableDescribtion)
      tableDescribtion['foreign_keys'].each do |ref|
        ref['references'] = ref['refs']
        ref.delete('refs')
      end
      JSON.generate(tableDescribtion)
    end

    ### Table Commands ###

    def self.addColumn(table)
      column_schema = SchemaColumn.new(table.columns.length, 'NewColumn', 'TEXT', 0, nil, 0)
      table.add_column(column_schema)
    end

    def self.deleteColumn(table, colHash, columnIndex)
      colHash.delete(table.columns.find { |col| col.index == columnIndex }.name)
      table.foreign_keys.each do |fk|
        fk.references.reject! { |ref| ref.from_column == table.columns.find { |col| col.index == columnIndex }.name }
      end
      table.foreign_keys.reject! { |fk| fk.references.empty? }
      table.columns.delete(table.columns.find { |col| col.index == columnIndex })
    end

    def self.switchColumn(table, columnOrder)
      table.columns = columnOrder.map { |col| table.columns.find { |tcol| tcol.index == col } }
    end

    def self.renameColumn(table, colHash, columnIndex, newName)
      colHash[table.columns.find { |col| col.index == columnIndex }.name] = newName
      table.columns.find { |col| col.index == columnIndex }.name = newName
    end

    def self.changeColumnType(table, columnIndex, newType)
      table.columns.find { |col| col.index == columnIndex }.type = newType
    end

    def self.changeColumnPrimaryKey(table, columnIndex)
      pk_column = table.columns.find { |col| col.index == columnIndex }
      pk_column.primary = !pk_column.primary
    end

    def self.changeColumnNotNull(table, columnIndex)
      col = table.columns.find { |col| col.index == columnIndex }
      col.not_null = !col.not_null
    end

    def self.changeColumnStandardValue(table, columnIndex, newValue)
      col = table.columns.find { |col| col.index == columnIndex }
      col.dflt_value = newValue
    end

    def self.changeTableName(table, newName)
      table.name = newName
    end

    def self.addForeignKey(table, foreignKey)
      foreign_key_comp = SchemaForeignKey.new
      foreignKey['references'].each do |fk|
        foreign_key_ref = SchemaForeignKeyRef.new(fk['from_column'], fk['to_table'], fk['to_column'])
        foreign_key_comp.add_foreign_key(foreign_key_ref)
      end
      table.add_foreign_keys(foreign_key_comp)
    end

    def self.removeForeignKey(table, foreignKey)
      refToDelete = nil
      foreign_key_comp = SchemaForeignKey.new
      foreignKey['references'].each do |fk|
        foreign_key_ref = SchemaForeignKeyRef.new(fk['from_column'], fk['to_table'], fk['to_column'])
        foreign_key_comp.add_foreign_key(foreign_key_ref)
      end
      table.foreign_keys.each do |ref|
        refToDelete = ref if ref.to_json(nil) == foreign_key_comp.to_json(nil)
      end
      table.foreign_keys.delete(refToDelete)
    end

    def self.createColumnHash(table)
      colHash = {}
      table.columns.each do |col|
        colHash[col.name] = col.name
      end
      colHash
    end
  end
end
