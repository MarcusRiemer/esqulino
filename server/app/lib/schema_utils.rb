# coding: utf-8
require 'sqlite3'

# Opens an SQLite3-connection that has access to an implementation
# of the REGEXP-function
#
# @param sqlite_file_path [string] The path to open
# @return [Sqlite3::Database]
def sqlite_open_augmented(sqlite_file_path, options = {})
  db = SQLite3::Database.open(sqlite_file_path, options)

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

  return db
end
