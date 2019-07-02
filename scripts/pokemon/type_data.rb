require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require_relative 'fetch_list'

lang_pos = {
  :de => 3,
  :en => 6,
  :fr => 2
}

# CSV output >> type_ID, de, en, fr

result = fetch('https://pokeapi.co/api/v2/type/')
csv_file = './csv/type-data.csv'


puts '### -- Getting info for each move...'
puts '### -- Writing into CSV: ' + csv_file

#For every row in result
CSV.open(csv_file, "w") do |csv|
  result.each_with_index do |row , i|
    if URI(row['url']).path.split('/').last.to_i < 10000 then
      tmp = JSON.parse(fetch_utf8(row['url']))
      res = Array.new

      res << tmp['id']

      lang_pos.each{|k,v| res.push(tmp['names'][v]['name'])}

      csv << res
    end
    #Output the progress
    output_progress(i,result.length,20)

  end
  puts '### -- Writing done.'
end