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
      gender = parse_gender row[2]
      dateofbirth = parse_date row[3..5]
      dateofdeath = parse_date row[6..8]

      if not dateofbirth.nil? then
        yearofdeath = if not dateofdeath.nil? then dateofdeath.year else '9999' end
        out << [id, name, gender, dateofbirth.year, yearofdeath]
      else
        STDERR.puts "Skipped: #{row}"
      end
    else
      STDERR.puts "Duplicate: #{row}"
    end
  rescue ArgumentError => e
    STDERR.puts "Error: #{e}\n#{row}"
  end
end
