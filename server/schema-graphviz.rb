require_relative './schema'

# Visualizes the table in form of a GraphViz description that
# still requires rendering.
def database_graphviz_schema(sqlite_file_path)
  schema = database_describe_schema(sqlite_file_path)

  # Add nodes for all tables
  tables = schema.map do |table|
    columns = table.columns.map do |c|
      c_type = (table.is_column_fk? c) ? "FK" : c.type
      "<TR><TD ALIGN=\"LEFT\" PORT=\"#{c.name}_name\">#{c.name}</TD><TD PORT=\"#{c.name}_type\">#{c_type}</TD></TR>"
    end
    columns = columns.join "\n"
    record_string = "<TABLE BORDER=\"1\" CELLBORDER=\"0\"><TR><TD COLSPAN=\"2\">#{table.name}</TD></TR><HR/>\n#{columns}</TABLE>"

    "#{table.name} [label=<#{record_string}>];"
  end

  tables = tables.join("\n")

  # Now that there are nodes for all tables we can start adding
  # the relationships
  refs = []
  schema.each do |table|
    table.foreign_keys.each do |fk|
      fk.references.each do |ref|
        to_port_suffix   = ref.to_table == table.name ? "name" : "name"
        from_port_suffix = ref.to_table == table.name ? "name" : "type"
        
        node_from = "#{table.name}:#{ref.from_column}_#{from_port_suffix}"
        node_to   = "#{ref.to_table}:#{ref.to_column}_#{to_port_suffix}"
        port_from = ref.to_table == table.name ? 'w' : 'e'
        port_to   = 'w'
        refs << "#{node_from}:#{port_from} -> #{node_to}:#{port_to} [concentrate=true];"
      end
    end
  end

  refs = refs.join("\n")

  to_return = <<-delim
digraph db {
  graph[rankdir=LR, splines=polyline];
  edge[dir=both, arrowhead=dot, arrowtail=dot];
  node[shape=plaintext];
  #{tables}
  #{refs}
}
  delim

  to_return     
end

if __FILE__ == $0
  puts (database_graphviz_schema ARGV[0])
end
