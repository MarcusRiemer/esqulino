# Visualizes the table in form of a GraphViz description that
# still requires rendering.
def database_graphviz_schema(sqlite_file_path)
  schema = database_describe_schema(sqlite_file_path)

  # Add nodes for all tables
  tables = schema
             .select {|table| not table.system?}
             .map do |table|
    columns = table.columns.map do |c|
      c_type = (table.is_column_fk? c) ? "FK" : c.type
      c_name = c.name
      c_pk = ""

      if c.primary
        c_name = "<B>#{c_name}</B>"
        c_pk = '<IMG SRC="vendor/icons/key.png" SCALE="TRUE"/>'
      end
      
      "<TR><TD WIDTH=\"16\" HEIGHT=\"16\" FIXEDSIZE=\"TRUE\" PORT=\"#{c.name}_name\">#{c_pk}</TD><TD ALIGN=\"LEFT\">#{c_name}</TD><TD ALIGN=\"LEFT\" PORT=\"#{c.name}_type\">#{c_type}</TD></TR>"
    end
    columns = columns.join "\n"
    record_string = "<TABLE BORDER=\"1\" CELLBORDER=\"0\"><TR><TD COLSPAN=\"3\">#{table.name}</TD></TR><HR/>\n#{columns}</TABLE>"

    "#{table.name.downcase} [label=<#{record_string}>];"
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
        
        node_from = "#{table.name.downcase}:#{ref.from_column}_#{from_port_suffix}"
        node_to   = "#{ref.to_table.downcase}:#{ref.to_column}_#{to_port_suffix}"
        port_from = ref.to_table == table.name ? 'w' : 'e'
        port_to   = 'w'
        refs << "#{node_from}:#{port_from} -> #{node_to}:#{port_to} [concentrate=true];"
      end
    end
  end

  refs = refs.join("\n")

  # TODO: Remove dirty hack to set the path!
  to_return = <<-delim
digraph db {
  graph[rankdir=LR, nodesep=0, splines=polyline, imagepath="../client/src", overlap=false];
  edge[dir=both, arrowhead=dot, arrowtail=dot];
  node[shape=plaintext, fontname = "Monospace"];
  #{tables}
  #{refs}
}
  delim

  to_return     
end

if __FILE__ == $0
  puts (database_graphviz_schema ARGV[0])
end
