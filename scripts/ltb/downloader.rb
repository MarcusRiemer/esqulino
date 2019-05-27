require "open-uri"
require "csv"

# Download Pictures from ltb-url.csv to /pics/
CSV.foreach("ltb-url.csv") do |row|
  open(row[0]) {|f|
  #The URL is at the 2nd Column -> row[1]
  File.open('./pics/' + row[1][/([^\/]+)$/],"wb") do |file|
    file.puts f.read
  end

}
end