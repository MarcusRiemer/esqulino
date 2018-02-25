require 'fileutils'

require_dependency 'error'
require_dependency 'schema_alter'
require_dependency 'schema_utils'
require_dependency 'schema'

# This is a database that is part of a certain project. In the current state
# of affairs we only support SQLite for these databases, but this might change
# sometime in the future.
class ProjectDatabase < ApplicationRecord
  belongs_to :project

  # Creating the database record for this instance is the trivial part.
  # The actual work is to create some sort of database-thing in the
  # "real world".
  #
  # This needs to happen after the creation in the database because we
  # need the id that was assigned.
  after_create do
    Rails.logger.info "Creating a SQLite database at #{sqlite_file_path}"
    FileUtils.touch sqlite_file_path
  end

  # The backing "database thing" needs to be destroyed along with this
  # record.
  before_destroy do
    Rails.logger.info "Deleting a SQLite database at #{sqlite_file_path}"
    File.delete(sqlite_file_path) if File.exists?(sqlite_file_path)
  end

  # Retrieves the path to the SQLite file for this database
  def sqlite_file_path
    File.join(project.data_directory_path, "databases", "#{id}.sqlite")
  end

  # Determines whether the given name of the table is part the schema of this
  # database.
  #
  # @param table_name [string] The name of the table in question
  # @return [Boolean] True if the given table_name is part of the database_schema
  def table_exists?(table_name)
    not table_schema(table_name).nil?
  end

  # Retrieves the schema for a specific table
  def table_schema(table_name)
    schema.find{ |table| table['name'] == table_name} unless schema.nil?
  end
  
  # Creates a new table in the schema of this database
  #
  # @param table_description
  #   The table with all its properties, see the 'TableDescription' schema
  def table_create(table_description)
    if table_exists? table_description['name'] then
      raise CreateDuplicateTableNameDatabaseError.new(self, table_description['name'])
    else
      db_connection_admin.execute(table_to_create_statement(table_description))
      refresh_schema
    end
  end

  # Alters the database according to the given commands
  def table_alter(table_name, alter_commands_description)
    schema = table_schema(table_name)
    if schema then
      # Do the actual altering and store the new schema
      database_alter_schema(self, table_name, alter_commands_description)
      refresh_schema
    else
      raise UnknownDatabaseTableError.new(self, table_name)
    end
  end

  # Deletes a table from the schema of this database
  #
  # @param table_description
  #   The table with all its properties, see the 'TableDescription' schema
  def table_delete(table_name)
    if table_exists? table_name then
      db_connection_admin.execute("DROP TABLE #{table_name}")
      refresh_schema
    else
      raise UnknownDatabaseTableError.new(self, table_name)
    end
  end

  # Retrieves paginated data of a certain table
  #
  # @param table_name [string] The name of the table.
  # @param from [Integer] The first row to fetch.
  # @param amount [Integer] The number of rows to fetch.
  # @return [Array<Array<String>>]] An array of strings for each row
  def table_row_data(table_name, from, amount)
    if table_exists? table_name then
      result = execute_sql("SELECT * FROM #{table_name} LIMIT ? OFFSET ?", [amount.to_i, from.to_i], true)
      result['rows']
    else
      raise UnknownDatabaseTableError.new(self, table_name)
    end
  end

  # Retrieves the number of rows of a certain table
  #
  # @param table_name [string] The name of the table.
  # @return [Integer] The number of rows
  def table_row_count(table_name)
    if table_exists? table_name then
      result = execute_sql("SELECT COUNT(*) FROM #{table_name}", [], true)
      result['rows'].first.first.to_i
    else
      raise UnknownDatabaseTableError.new(self, table_name)
    end
  end

  # Refreshes the cached schema.
  def refresh_schema
    # Not so nice: Explicitly calling this complicated version of serializable_hash here
    self.schema = database_describe_schema(db_connection_admin)
                    .map { |t| t.serializable_hash(include: { columns: { }, foreign_keys: {} }) }
  end
  
  # Refreshes and persists a possibly changed schema.
  def refresh_schema!
    refresh_schema
    save!
  end

  # Executes a arbitrary SQL query in the context of this project. This is of course
  # a major security concern and shouldn't be done lightly.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  #
  # @return [Hash] { columns :: List, rows :: List of List }
  def execute_sql(sql, params, read_only = false)
    # The SQLite driver returns the names of the columns in the first row. But we want
    # those to go in a hash with explicit names.
    execute_sql_raw(read_only) do |db|
      result = db.execute2(sql, params)
      return {
        'columns' => result.first,
        'rows' => result.drop(1)
      }
    end
  end

  # This method is hopefully unnecessary
  def flush!
    if not @db_connection.nil? then
      @db_connection.close
      @db_connection = nil
    end

    if not @db_connection_readonly.nil? then
      @db_connection_readonly.close
      @db_connection_readonly = nil
    end

    if not @db_connection_admin.nil? then
      @db_connection_admin.close
      @db_connection_admin = nil
    end
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{self.name}\" (#{self.id})"
  end

  protected

  # Allows to access the underlying database connection.
  #
  # @param read_only [Boolean]
  #   May be set to true if the returned collection shouldn't allow changes.
  #
  # @return
  #   The database connection instance that should be used for all communication
  #   with the database-instance behind this model.
  def db_connection(read_only = true)
    if read_only
      db_connection_readonly
    else
      # Writing connections need to be in synchronous mode so that the readonly
      # connection can see any changes immediately.
      @db_connection ||= sqlite_open_augmented(sqlite_file_path, :synchronous => "full")
    end
  end

  # @return
  #   A database connection that does not allow any changes to the underlying data or structure.
  def db_connection_readonly
    @db_connection_readonly ||= sqlite_open_augmented(sqlite_file_path, :read_only => true)
  end

  # @return
  #   A database connection that allow any changes to the underlying data or structure.
  def db_connection_admin
    @db_connection_admin ||= db_connection(false)
  end

  private

  # Prepares a properly constructed database object and deals with
  # exceptions that occur during query execution.
  def execute_sql_raw(read_only = true)
    db = db_connection(read_only)
    db.execute("PRAGMA foreign_keys = ON")

    # Exceptions that could occur fall in one of two categories
    begin
      yield db
    rescue SQLite3::ConstraintException, SQLite3::SQLException => e
      # Something anticipated went wrong. This is probably the fault
      # of the caller in some way.
      raise DatabaseQueryError.new(self, sql, params, e, false)
    rescue SQLite3::Exception => e
      # Something unanticipated went wrong. We assume this is an error in our
      # implementation (either server or client).
      raise DatabaseQueryError.new(self, sql, params, e, true)
    end

    db.execute("PRAGMA foreign_keys = OFF")
  end
end

# Something went wrong when altering a database schema.
class AlterProjectDatabaseError < EsqulinoError
  # @param project_database [ProjectDatabase]
  #   The database the error occured in
  def initialize(project_database, data, code=400)
    super "Could not alter database \"#{project_database.id}\" of project \"#{project_database.project_id}\"", code
    @data = data
  end
end

# Attempted to create a table with a name that already exists.
class CreateDuplicateTableNameDatabaseError < AlterProjectDatabaseError
  def initialize(project_database, table_name)
    super(project_database, { "tableName" => table_name })
  end
end
