#!/bin/ruby
# coding: utf-8

require 'net/http'
require 'nokogiri'
require 'uri'
require 'csv'
require 'set'

def is_numeric?(obj)
  obj.to_s.match(/\A[+-]?\d+?(\.\d+)?\Z/) == nil ? false : true
end

# Downloads a certain episode and represents it as a DOM-parser
def download_info(europa_num)
  num = europa_num.to_s.rjust(3, "0")
  request_uri = URI.parse("https://www.rocky-beach.com/hoerspiel/folgen/#{num}.html")
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

# Rocky-Beach.com is not consistent with their character names
$character_synonyms = {
  "Mathilda" => "Mathilda Jonas",
  "Tante Mathilda Jonas" => "Mathilda Jonas",
  "Tante Mathilda" => "Mathilda Jonas",
  "Mrs. Tante Mathilda Jonas" => "Mathilda Jonas",
  "Onkel Titus Jonas" => "Titus Jonas",
  "Onkel Titus" => "Titus Jonas",
  "Skinny" => "Skinny Norris",
  "Dr. Franklin" => "Clarissa Franklin"
}

# Maps character names to character IDs
$characters = Hash.new
# Maps actor names to actor IDs
$actors = Hash.new
# Maps europa story numbers to story IDs
$stories = Hash.new
# Associations of actors with characters
# TODO: This is possibly obsolete, some characters habe been played
#       by multiple actors
#$actor_char = Set.new

# List of pairs with occurences: (actor_id, char_id)
#
# TODO: This should be a triple: (story_id, actor_id, char_id)
$occurence = Set.new

# rocky-beach.com uses the "Europa" numbering, so we need
# to build an index of them to our internal IDs (which are different).
CSV.foreach("Geschichte.csv") do |row|
  if is_numeric? row[0] and is_numeric? row[3] then
    unique_id = row[0].to_i
    europa_id = row[3].to_i

    $stories[europa_id] = unique_id
  end
end

def scrape_info(num)
  # The actor data is in a deeply nested table ...
  doc = download_info(num).css("body > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > center:nth-child(3) > table:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1)")

  doc.css('tr').each do |row|
    if row.text == "Neuabmischung:"
      # We are not interested in the new re-releases
      break
    elsif row.text.strip.empty? or row.text.strip.match? /Teil ./ then
      # Do nothing, this could possibly be expressed nicer
    else
      character_td = row.children[0].children[0]
      actor_td = if row.children.length == 2 then row.children[1] else row.children[2] end

      name = row.children[0].children[0].text.strip

      # Some roles have small descriptions, we don't need them
      comma_index = name.rindex(',')
      if comma_index then
        name = name[0..(comma_index - 1)]
      end

      name = $character_synonyms.fetch(name, name)

      actor = actor_td.text.strip

      # Some actors got updated, we want the most recent actor in brackets
      if actor.match?(/\[(.*)\]/) then
        actor = actor.match(/\[(.*)\]/)[1]
      end

      # Some roles have multiple actors
      actor = actor.split(',')
                .map { |a| a.strip }

      # Possibly add this character as a new character
      if not $characters.key? name then
        $characters[name] = $characters.length + 1
      end

      char_id = $characters[name]

      actor.each do |a|
        question_index = a.rindex('?')
        if question_index then
          a = a[0..(question_index - 1)]
        end

        # Possibly add this actor as a new actor
        if not $actors.key? a then
          $actors[a] = $actors.length + 1
        end

        actor_id = $actors[a]

        #$actor_char.add([actor_id, char_id])

        # Remember the occurence of this char
        $occurence << [$stories[num],char_id,actor_id]

      end
    end
  end
end

# Read limits from where to parse
from = ARGV[0].to_i
to = ARGV[1].to_i

puts "Scrape #{from} to #{to}"

# Progress output and actual scraping
from.upto(to) do |i|
  # Episode 29 is the music episode
  if i != 29 then
    $stdout.write "#{i} "
    scrape_info(i)
  end
end

# File output
puts ""

puts "Charaktere: #{$characters.length}"
CSV.open("Charakter.csv", "w") do |file|
  $characters.each do |name,id|
    file << [id.to_i, name]
  end
end

puts "Sprecher: #{$actors.length}"
CSV.open("Sprecher.csv", "w") do |file|
  $actors.each do |name,id|
    file << [id.to_i, name]
  end
end

#puts "Charakter_Sprecher: #{$actor_char.length} "
#CSV.open("Charakter_Sprecher.csv", "w") do |file|
#  $actor_char.each do |pair|
#    actor_id, char_id = pair[0], pair[1]
#    file << [char_id.to_i, actor_id.to_i]
#  end
#end

puts "Auftritt: #{$occurence.length}"
CSV.open("Auftritt.csv", "w") do |file|
  $occurence.each do |story_id,char_id,actor_id|
    #story_id, char_id = pair[0], pair[1]
    file << [story_id.to_i, char_id.to_i,actor_id.to_i]
  end
end
