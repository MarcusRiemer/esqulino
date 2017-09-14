#!/bin/ruby
require 'set'

require_relative './util'

dupes = Set.new

each_row($0) do |out,row|
  begin
    id = extract_id row[0]
    if (not dupes.include? id) then
      dupes.add id
      name = row[1]
      type = row[2]

      datebegin = parse_date row[3]
      dateend = parse_date row[4]

      out << [id, name, datebegin.year, dateend.nil? ? "9999" : dateend.year]
      
    else
      STDERR.puts "Duplicate: #{row}"
    end
  rescue ArgumentError => e
    STDERR.puts "Error: #{e}\n#{row}"
  end
end
