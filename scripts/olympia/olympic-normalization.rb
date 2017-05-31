#!/bin/ruby

require 'csv'

COLOUR_MAPPING = {
  "Gold" => 1,
  "Silver" => 2,
  "Bronze" => 3
}

in_summer_games = CSV.read("summer.csv", headers: true)
in_winter_games = CSV.read("winter.csv", headers: true)

if ARGV.length == 1 and ARGV[0] == "--subset"
  in_summer_games = in_summer_games.take 100
  in_winter_games = in_winter_games.take 100
end

events = {}
disciplines = {}
medals = {}

in_summer_games
  .map {|v| [v['Year'], v['City']] }
  .uniq
  .each {|v| events[v[0].to_i] = { :event_id => events.count + 1, :type => "Summer", :year => v[0].to_i, :city => v[1] }}

in_winter_games
  .map {|v| [v['Year'], v['City']] }
  .uniq
  .each {|v| events[v[0].to_i] = { :event_id => events.count + 1, :type => "Winter", :year => v[0].to_i, :city => v[1] }}

in_summer_games
  .map {|v| v['Discipline'] }
  .uniq
  .each {|v| disciplines[v] = { :discipline_id => disciplines.count + 1, :name => v}}

in_winter_games
  .map {|v| v['Discipline'] }
  .uniq
  .each {|v| disciplines[v] = { :discipline_id => disciplines.count + 1, :name => v}}

in_summer_games.each do |v|
  medals[medals.count + 1] = {
    :event_id => events[v['Year'].to_i][:event_id],
    :medal_id => medals.count + 1,
    :discipline_id => disciplines[v['Discipline']][:discipline_id],
    :athlete_name => v['Athlete'],
    :gender => v['Gender'],
    :for => v['Event'],
    :place => COLOUR_MAPPING[v['Medal']]
  }
end

files = {
  "table_medals.csv" => medals,
  "table_disciplines.csv" => disciplines,
  "table_events.csv" => events
}

files.each do |filename, data|
  CSV.open(filename, "wb") do |csv|
    # csv << data[data.keys.first].keys
    data.values.each do |v|
      csv << v.values
    end
  end
end


