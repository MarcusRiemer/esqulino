require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require_relative 'fetch_list'

# CSV output >> pkmn_ID, de, en, fr, evolve_from_ID

lang_pos = {
  :de => 5,
  :en => 2,
  :fr => 6
}

result = fetch('https://pokeapi.co/api/v2/pokemon-species/')
csv_file = './csv/pkmn-data.csv'

puts '### -- Getting info for each move...'
puts '### -- Writing into CSV: ' + csv_file

#For every row in result
CSV.open(csv_file, "w") do |csv|
  result.each_with_index do |row , i|

    tmp = JSON.parse(fetch_utf8(row['url']))
    res = Array.new

    res << tmp['id']

    lang_pos.each{|k,v| res.push(tmp['names'][v]['name'])}

    if !tmp['evolves_from_species'].nil? 
      res << JSON.parse(Nokogiri::HTML(open(tmp['evolves_from_species']['url'])))['id'] 
      else res << nil
    end
    
    csv << res
    #Output the progress
    output_progress(i,result.length,20)

  end
  puts '### -- Writing done.'
end






