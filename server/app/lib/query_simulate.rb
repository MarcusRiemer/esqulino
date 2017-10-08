require 'sqlite3'

require_dependency 'sql_accessor'

module SimulateSql
  # Simulates the execution of a DELETE query on any (?) database.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  def self.delete_sql(db, sql, params)
    # Extract everything from the query to turn it into a SELECT
    # query that matches exactly the things that would be deleted
    tablename = SqlAccessor::first_from_tablename sql
    where_whole = SqlAccessor::where_whole sql

    # Find out deleted IDs
    query_deleted_ids = db
                          .execute2("SELECT rowid\nFROM #{tablename}\nWHERE #{where_whole}", params)
                          .drop(1)
                          .flatten

    # Grab some IDs around the deleted IDs
    query_result_ids = query_deleted_ids
                         .map {|v| Array(v-2..v+2)}
                         .flatten

    # Fetch deleted rows
    rows_deleted = db.execute2 "SELECT *\nFROM #{tablename}\nWHERE rowid IN(#{query_deleted_ids.join ','})"
    # Fetch adjacent rows
    rows = db.execute2 "SELECT *\nFROM #{tablename}\nWHERE rowid IN(#{query_result_ids.join ','})"

    return {
      'columns' => rows.first,
      'rows' => rows.drop(1),
      'highlight' => highlight_rows(rows, rows_deleted),
      'affected' => rows_deleted.drop(1)
    }
  end

  # Simulates the execution of a INSERT query on any (?) database.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  def self.insert_sql(db, sql, params)
    # Extracting the tablename of the SQL-query
    guessed_tablename = SqlAccessor::insert_tablename(sql)

    begin
      # We wrap the whole execution in a transaction and then
      # run the query to look at the newly added ID.
      db.transaction
      db.execute2 sql, params
      rowid = db.last_insert_row_id

      # We fetch exactly that row from the database
      inserted = db.execute2 "SELECT * FROM #{guessed_tablename} WHERE rowid = #{rowid}"
      columns = inserted.first
      inserted = inserted.drop(1)

      # And we fetch rows around that row
      rows = db.execute2 "SELECT * FROM #{guessed_tablename} WHERE rowid BETWEEN #{rowid - 2} AND #{rowid + 2}"

      return {
        'columns' => columns,
        'rows' => rows.drop(1),
        'highlight' => highlight_rows(rows, inserted),
        'affected' => inserted,
      }
    ensure
      # We always undo all changes that have been made.
      db.rollback
    end
  end

  # Calculates the indices of rows in `all_rows` that are a element
  # of `highlight_rows`
  def self.highlight_rows(all_rows, highlight_rows)
    all_rows
      .drop(1) # First row are the names of the columns
      .map.with_index {|r,i| [r,i] } # We ultimately want to know which array indices to highlight
      .reject {|r,i| not highlight_rows.include? r } # Ignore everything that is not in the result set
      .map {|r,i| i } # And grab only the index in the result array
  end
end
