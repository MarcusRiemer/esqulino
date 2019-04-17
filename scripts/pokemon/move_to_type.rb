require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'
require_relative 'fetch_list'

# CSV output >> move_ID, type_ID

result = fetch('https://pokeapi.co/api/v2/move/')
csv_file = './csv/move-to-type.csv'

puts '### -- Getting info for each move...'
puts '### -- Writing into CSV: ' + csv_file

#For every row in result
CSV.open(csv_file, "w") do |csv|
  result.each_with_index do |row , i|
    if URI(row['url']).path.split('/').last.to_i < 10000 then
      tmp = JSON.parse(Nokogiri::HTML(open(row['url'])))
      csv << ([
        tmp['id'],
        URI(tmp['type']['url']).path.split('/').last.to_i
      ])
    end
    #Output the progress
    output_progress(i,result.length,20)
  end
  puts '### -- Writing done.'
end
