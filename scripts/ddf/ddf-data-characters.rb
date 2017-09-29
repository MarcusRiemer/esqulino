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

def download_info(europa_num)
  num = europa_num.to_s.rjust(3, "0")
  request_uri = URI.parse("http://www.rocky-beach.com/hoerspiel/folgen/#{num}.html")
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

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

$characters = Hash.new
$stories = Hash.new
$actors = Hash.new
$actor_char = Set.new
$occurence = []

CSV.foreach("Geschichte.csv") do |row|
  if is_numeric? row[0] and is_numeric? row[3] then
    unique_id = row[0].to_i
    europa_id = row[3].to_i

    $stories[europa_id] = unique_id
  end
end

def scrape_info(num) 

  doc = download_info(num).css("body > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > center:nth-child(3) > table:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1)")

  doc.css('tr').each do |row|
    if row.text == "Neuabmischung:" or row.text.strip.empty? or row.text.strip.match? /Teil ./ then
      
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

      # Remember the occurence of this char
      $occurence << [$stories[num],char_id]

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

        $actor_char.add([actor_id, char_id])
      end
    end
  end
end

from = ARGV[0].to_i
to = ARGV[1].to_i

puts "Scrape #{from} to #{to}"

from.upto(to) do |i|
  if i != 29 then
    $stdout.write "#{i} "
    scrape_info(i)
  end
end

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

puts "Charakter_Sprecher: #{$actor_char.length} "
CSV.open("Charakter_Sprecher.csv", "w") do |file|
  $actor_char.each do |pair|
    actor_id, char_id = pair[0], pair[1]
    file << [char_id.to_i, actor_id.to_i]
  end
end

puts "Auftritt: #{$occurence.length}"
CSV.open("Auftritt.csv", "w") do |file|
  $occurence.each do |pair|
    story_id, char_id = pair[0], pair[1]
    file << [story_id.to_i, char_id.to_i]
  end
end


