require "open-uri"
require "csv"

# Download Pictures from ltb-url.csv to /pics/
CSV.foreach("ltb-url.csv") do |row|
  open(row[0]) {|f|
  File.open('./pics/' + row[0][/([^\/]+)$/],"wb") do |file|
    file.puts f.read
  end

}
end