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
  before_create do
    Rails.logger.info "Creating a SQLite database at #{sqlite_file_path}"
    SQLite3::Database.new sqlite_file_path
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
    not schema.nil? and not schema.find {|table| table['name'] == table_name}.nil?
  end

  # Refreshes and persists a possibly changed schema.
  def refresh_schema!
    # Not so nice: Explicitly calling this complicated version of serializable_hash here
    self.schema = database_describe_schema(db_connection)
                    .map { |t| t.serializable_hash(include: { columns: { }, foreign_keys: {} }) }
    save!
  end

  # Executes a arbitrary SQL query in the context of this project. This is of course
  # a major security concern and shouldn't be done lightly.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  #
  # @return [Hash] { columns :: List, rows :: List of List }
  def execute_sql(sql, params)
    # The SQLite driver returns the names of the columns in the first row. But we want
    # those to go in a hash with explicit names.
    execute_sql_raw do |db|
      result = db.execute2(sql, params)
      return {
        'columns' => result.first,
        'rows' => result.drop(1)
      }
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
  def db_connection(read_only = nil)
    if read_only
      db_connection_readonly
    else
      @db_connection ||= sqlite_open_augmented(sqlite_file_path)
    end
  end

  # @return
  #   A database connection that does not allow any changes to the underlying data.
  def db_connection_readonly
    @db_connection ||= sqlite_open_augmented(sqlite_file_path, :read_only => true)
  end

  private

  # Prepares a properly constructed database object and deals with
  # exceptions that occur during query execution.
  def execute_sql_raw(read_only = nil)
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
