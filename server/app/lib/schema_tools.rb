# frozen_string_literal: true

require 'sqlite3'

module SchemaTools
  # Opens an SQLite3-connection that has access to an implementation
  # of the REGEXP-function
  #
  # @param sqlite_file_path [string] The path to open
  # @return [Sqlite3::Database]
  def self.sqlite_open_augmented(sqlite_file_path, options = {})
    db = SQLite3::Database.open(sqlite_file_path, options)

    # Define the regular expressions using ruby
    db.create_function('regexp', 2) do |func, pattern, expression|
      func.result = if expression.nil?
                      # Return true if the value is null, let the DB handle this
                      1
                    elsif expression.to_s.match(
                      Regexp.new(pattern.to_s, Regexp::IGNORECASE)
                    )
                      1
                    else
                      0
                    end
    end

    db
  end

  # Describes the schema of a whole database as a handy dictionary
  # of tables with their columns.
  #
  # @param sqlite_db [string|SQLite3::Database]
  #   Path to the database or an instance of it
  # @return [Hash] A hash of SchemaTable instances
  def self.database_describe_schema(sqlite_db)
    db = if sqlite_db.is_a? String
           SQLite3::Database.new(sqlite_db)
         else
           sqlite_db
         end

    # Find out names of tables
    table_names = db.execute("SELECT name
                            FROM sqlite_master
                            WHERE type='table'
                            ORDER BY name;")

    tables = []

    # Fill in the column for each table
    table_names.each do |name|
      # Find out everything about the table itself
      name = name[0]
      table_schema = SchemaTable.new name
      db.execute("PRAGMA table_info(#{name})") do |ci|
        column_schema = SchemaColumn.new(ci[0], ci[1], ci[2], ci[3], ci[4], ci[5])
        table_schema.add_column(column_schema)
      end

      # Get all foreign keys in a list and append them to the table
      foreign_keys_table = db.execute("PRAGMA foreign_key_list(#{name})")

      # A foreign key may consist of multiple columns, so we group all
      # columns that belong to the same foreign key
      grouped_foreign_keys = foreign_keys_table.group_by { |fk| fk[0] }
      grouped_foreign_keys.each do |_key, value|
        foreign_key_comp = SchemaForeignKey.new
        # Add all columns that are part of this particular foreign key
        value.each do |fk|
          foreign_key_ref = SchemaForeignKeyRef.new(fk[3], fk[2], fk[4])
          foreign_key_comp.add_foreign_key(foreign_key_ref)
        end
        table_schema.add_foreign_keys(foreign_key_comp)
      end

      tables << table_schema
    end

    tables
  end

  # Visualizes the table in form of a GraphViz description that
  # still requires rendering.
  def self.database_graphviz_schema(sqlite_file_path)
    schema = database_describe_schema(sqlite_file_path)

    # Add nodes for all tables
    tables = schema
             .reject(&:system?)
             .map do |table|
      columns = table.columns.map do |c|
        c_type = (table.is_column_fk? c) ? 'FK' : c.type
        c_name = c.name
        c_pk = ''

        if c.primary
          c_name = "<B>#{c_name}</B>"
          c_pk = '<IMG SRC="vendor/icons/key.png" SCALE="TRUE"/>'
        end

        "<TR><TD WIDTH=\"16\" HEIGHT=\"16\" FIXEDSIZE=\"TRUE\" PORT=\"#{c.name}_name\">#{c_pk}</TD><TD ALIGN=\"LEFT\">#{c_name}</TD><TD ALIGN=\"LEFT\" PORT=\"#{c.name}_type\">#{c_type}</TD></TR>"
      end
      columns = columns.join "\n"
      record_string = "<TABLE BORDER=\"1\" CELLBORDER=\"0\"><TR><TD COLSPAN=\"3\">#{table.name}</TD></TR><HR/>\n#{columns}</TABLE>"

      "#{table.name.downcase} [label=<#{record_string}> class=\"#{table.name}\"];"
    end

    tables = tables.join("\n")

    # Now that there are nodes for all tables we can start adding
    # the relationships
    refs = []
    schema.each do |table|
      table.foreign_keys.each do |fk|
        fk.references.each do |ref|
          to_port_suffix   = ref.to_table == table.name ? 'name' : 'name'
          from_port_suffix = ref.to_table == table.name ? 'name' : 'type'

          node_from = "#{table.name.downcase}:#{ref.from_column}_#{from_port_suffix}"
          node_to   = "#{ref.to_table.downcase}:#{ref.to_column}_#{to_port_suffix}"
          port_from = ref.to_table == table.name ? 'w' : 'e'
          port_to   = 'w'
          refs << "#{node_from}:#{port_from} -> #{node_to}:#{port_to} [concentrate=true class=\"#{table.name.downcase} #{ref.to_table.downcase}\"];"
        end
      end
    end

    refs = refs.join("\n")

    # TODO: Remove dirty hack to set the path!
    <<~DELIM
      digraph db {
        graph[rankdir=LR, nodesep=0, splines=polyline, imagepath="../client/src", overlap=false];
        edge[dir=both, arrowhead=dot, arrowtail=dot];
        node[shape=plaintext, fontname = "Monospace"];
        #{tables}
        #{refs}
      }
    DELIM
  end
end
