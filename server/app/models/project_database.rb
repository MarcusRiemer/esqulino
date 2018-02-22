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
  def has_table(table_name)
    not schema(database_id).find {|table| table.name == table_name}.nil?
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{self.name}\" (#{self.id})"
  end
end
