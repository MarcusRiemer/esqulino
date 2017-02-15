require_relative './schema'

def database_alter_schema(sqlite_file_path)
end


if __FILE__ == $0
  puts (database_alter_schema ARGV[0])
end