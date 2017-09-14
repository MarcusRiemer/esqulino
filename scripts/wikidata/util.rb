require 'date'
require 'csv'

require_relative './run-query'


WIKIDATA_ENTITY_PREFIX = 'http://www.wikidata.org/entity/'

GENDER = {
  "Q6581097" => "m",
  "Q6581072" => "w",
  "Q1052281" => "mzw",
  "Q2449503" => "wzm",
  "Q1097630" => "inter",
  "Q48270" => "queer"
}

def extract_id(cell)
  if cell.start_with? WIKIDATA_ENTITY_PREFIX then
    cell[WIKIDATA_ENTITY_PREFIX.length, 10]
  else
    nil
  end
end

def parse_date(cell)
  cell = if cell.is_a? String then
           [cell]
         elsif cell.nil? then
           []
         else
           cell
         end
  
  cell = cell
           .reject {|c| c.nil? }
           .reject {|c| c.start_with? '_:t'}
           .map {|c| Date.parse c}
           .reject {|c| c.nil? }
  cell.fetch(0, nil)
end

def parse_gender(cell)
  entity_id = extract_id cell
  if not entity_id.nil? then
    GENDER.fetch(entity_id, '!NULL!')
  else
    STDERR.puts "Invalid Gender: #{cell}"
    nil
  end
end

def each_row(script_filepath)
  query_filepath = "#{File.dirname(script_filepath)}/#{File.basename(script_filepath,'.*')}.sparql"
  
  first = true
  CSV($stdout, :force_quotes => false) do |csv|
    CSV.parse(query_content(query_filepath)) do |row|
      if first then
        first = false
      else
        yield csv, row
      end
    end
  end
end
