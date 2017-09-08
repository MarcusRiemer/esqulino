#!/bin/ruby
# coding: utf-8

require 'net/http'
require 'nokogiri'
require 'uri'

request_uri = URI.parse("https://de.wikipedia.org/wiki/Liste_der_Die-drei-%3F%3F%3F-Folgen")
response = Net::HTTP.get_response(request_uri)

source = response.body
doc = Nokogiri::XML.parse(source) do |config|
  config.noblanks
end

def ensure_number(cell)
  if not /\d+/ =~ cell then
    ""
  else
    cell
  end
end

def title_only(cell)
  cell[/[^\[]*/].strip
end

puts "geschichte_id,geschichte_name,geschichte_nr_kosmos,geschichte_nr_europa,geschichte_jahr_kosmos,geschichte_jahr_europa"

doc_first_episodes = doc.css("table.wikitable:nth-child(10) tr")

record_num = 1

doc_first_episodes[1..-2].each_with_index do |row, idx|
  
  nr_kosmos = row.children[0].text
  nr_europa = row.children[1].text
  jahr_kosmos = row.children[7].text.lines[0].strip
  jahr_europa = row.children[8].text.lines[0].strip
  titel_de = row.children[4].text

  jahr_kosmos = ensure_number(jahr_kosmos)
  jahr_europa = ensure_number(jahr_europa)
  nr_kosmos = ensure_number(nr_kosmos)
  nr_europa = ensure_number(nr_europa)
  
  if (idx != 44) then
    puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    record_num += 1
  end
end

doc_current_episodes = doc.css("table.wikitable:nth-child(13) tr")

doc_current_episodes[1..-2].each_with_index do |row, idx|
  nr_kosmos = row.children[0].text
  nr_europa = row.children[1].text
  jahr_kosmos = row.children[4].text.lines[0].strip
  jahr_europa = row.children[5].text.lines[0].strip

  jahr_kosmos = ensure_number(jahr_kosmos)
  jahr_europa = ensure_number(jahr_europa)
  nr_kosmos = ensure_number(nr_kosmos)
  nr_europa = ensure_number(nr_europa)

  title_text = row.children[2].text
  
  if title_text.lines.length == 1 then
    titel_de = title_only(title_text)
    puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    record_num += 1  
  else
    general_title = title_only(title_text.lines[0])
    row.css("td:nth-child(3) li").map {|l| l.text }.each do |title|
      titel_de = general_title + ' ' + title
      puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
      record_num += 1  
    end
  end
end



#puts doc_first_episodes
