#!/bin/ruby
# coding: utf-8

require 'net/http'
require 'nokogiri'
require 'uri'
require 'csv'

# We use the german wikipedia list
#
# BEWARE: The tables on this page are referenced using `nth-child`-Selectors which
#         is not the epitome of stability.
request_uri = URI.parse("https://de.wikipedia.org/wiki/Liste_der_Die-drei-%3F%3F%3F-Folgen")
response = Net::HTTP.get_response(request_uri)

source = response.body
doc = Nokogiri::XML.parse(source) do |config|
  config.noblanks # We don't want entirely empty text nodes, they are confusing
end

# Extracts a number with 1 to 4 digits out of a cell
def ensure_number(cell)
  # No Number at all?
  if not /\d+/ =~ cell then
    ""
  # Some special "numbers" begin with TSE
  elsif /TSE/ =~ cell then
    cell
  # All other numbers have 1 to 4 digits
  else
    cell[/(\d{1,4})/,1].to_i
  end
end

# Some cells have references to footnotes, we dont want them
def title_only(cell)
  cell[/([^\[]*).*/, 1].strip
end

#puts "geschichte_id,geschichte_name,geschichte_nr_kosmos,geschichte_nr_europa,geschichte_jahr_kosmos,geschichte_jahr_europa"

doc_first_episodes = doc.css("table.wikitable:nth-child(8) tr")

record_num = 1

doc_first_episodes[1..-2].each_with_index do |row, idx|
  nr_kosmos = row.children[0].text.lines[0].strip
  nr_europa = row.children[1].text.lines[0].strip
  jahr_kosmos = row.children[7].text.lines[0].strip
  jahr_europa = row.children[8].text.lines[0].strip
  titel_de = title_only(row.children[4].text)

  jahr_kosmos = ensure_number(jahr_kosmos)
  jahr_europa = ensure_number(jahr_europa)
  nr_kosmos = ensure_number(nr_kosmos)
  nr_europa = ensure_number(nr_europa)

  if (jahr_kosmos == 0) then
    puts "ERR", row.children[7].text.lines[0]
  end

  # Row 44 conains a very verbose set of footnotes, not an actual episode
  if (idx != 44) then
    puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    record_num += 1
  end
end

doc_current_episodes = doc.css("table.wikitable:nth-child(11) tr")

doc_current_episodes[1..-2].each_with_index do |row, idx|
  nr_kosmos = row.children[0].text
  nr_europa = row.children[1].text
  jahr_kosmos = row.children[4].text.lines[0].strip
  jahr_europa = row.children[5].text.lines[0].strip

  jahr_kosmos = ensure_number(jahr_kosmos)
  jahr_europa = ensure_number(jahr_europa)
  nr_kosmos = ensure_number(nr_kosmos)
  nr_europa = ensure_number(nr_europa)

  title_text = title_only(row.children[2].text)

  if title_text.lines.length == 1 then
    titel_de = title_only(title_text)
    puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    record_num += 1
  else
    general_title = title_only(title_text.lines[0]).tr(':', '')
    puts "#{record_num},\"#{general_title}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    record_num += 1
    #row.css("td:nth-child(3) li").map {|l| l.text }.each do |title|
    #  titel_de = general_title + ' ' + title
    #  puts "#{record_num},\"#{titel_de}\",#{nr_kosmos},#{nr_europa},#{jahr_kosmos},#{jahr_europa}"
    #  record_num += 1
    #end
  end
end



#puts doc_first_episodes
