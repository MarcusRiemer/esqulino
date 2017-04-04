#!/bin/ruby
# coding: utf-8

require 'net/http'
require 'nokogiri'
require 'csv'


type_ids = {
  "Normal" => 1, "Kampf" => 2, "Flug" => 3, "Gift" => 4, "Boden" => 5, "Gestein" => 6, "Käfer" => 7, "Geist" => 8, "Stahl" => 9, "Feuer" => 10, "Wasser" => 11, "Pflanze" => 12, "Elektro" => 13, "Psycho" => 14, "Eis" => 15, "Drache" => 16, "Unlicht" => 17, "Fee" => 18, "NULL" => "NULL"
}

# Eevee evolutions can't be scraped in a meaningful way and
# are therefore compiled in statically.
known_evolutions = {
  134 => 133,
  135 => 133,
  136 => 133,
  196 => 133,
  197 => 133,
  470 => 133,
  471 => 133,
  700 => 133,
}

# Storage for all pokemon, this lookup is required
# when checking evolutions
de_pkmn = {}


start_from = ARGV[0].to_i- 1
take_num = ARGV[1].to_i - start_from


STDERR.puts "Grabbing from #{start_from + 1} to #{start_from + take_num}"

# Scraping the list of pokemon
$pokewiki_root = 'pokewiki.de'.freeze
source = Net::HTTP.get($pokewiki_root, '/Pokémon-Liste')
doc = Nokogiri::HTML source

# Checking whether all entries are valid
doc_all_pkmn = doc.css("#bodyContent table.prettytable tr")
doc_valid_pkmn = doc_all_pkmn.select { |p| not p.nil? }

STDERR.puts("Got #{doc_all_pkmn.length} entries, #{doc_valid_pkmn.length} are valid")

def parse_evolution(doc_single_pkmn, pkmn, de_pkmn)
  # Search all evolution tables
  doc_single_pkmn.css("table.center").each_with_index do |evolutions_table, i|    
    evolutions = evolutions_table.css("div.round-bottom").map {|i| i.text.strip }.uniq
    evo_index = evolutions.find_index(pkmn['de'])
    
    if evo_index and evo_index > 0  then  
      pre_pkmn = de_pkmn[evolutions[evo_index - 1]]

      # Some pokemon evolve from pokemon with later ids
      if pre_pkmn.nil? then
        # And in that case we simply fetch them
        pre_evo_source = Net::HTTP.get($pokewiki_root, "/" + evolutions[evo_index - 1])
        pre_evo_doc = Nokogiri::HTML pre_evo_source


        national_dex_doc = pre_evo_doc.css("table.right tr")
                             .select {|pre_single_doc| pre_single_doc.css("td")[0].text.strip == "National-Dex" }

        # Number is formatted like "#xyz" so we need to get rid of the hash
        pre_evo_id = national_dex_doc[0].css("td")[1].text.strip[1..-1]          
        return pre_evo_id
        
      else
        # We know this pokemon already, no need for a further request
        return pre_pkmn['id']
      end
    end
  end

  return "NULL"
end

# And start emitting the entries
CSV do |csv|
  doc_all_pkmn.drop(1 + start_from).take(take_num).each_with_index do |e, i|    
    cells = e.css("td")

    STDERR.puts("#{start_from + i}: Got #{cells.length} cells")
    
    
    pkmn_types = cells[8].text.strip.split(/[[:space:]]+/)

    pkmn = {
      "id" => cells[0].text.strip.to_i,
      "de" => cells[2].text.strip,
      "en" => cells[3].text.strip,
      "typ1" => type_ids[pkmn_types[0]],
      "typ2" => type_ids[pkmn_types.fetch(1, 'NULL')]
    }

    if not known_evolutions.key? pkmn['id'] then
      # The CSS-class to center tables is sometimes in german ...
      source_pkmn = Net::HTTP.get($pokewiki_root, "/#{pkmn['de']}")
                      .gsub("zentriert", "center")
                      .gsub("centered", "center")
      
      doc_single_pkmn = Nokogiri::HTML source_pkmn

      known_evolutions[pkmn['id']] = parse_evolution(doc_single_pkmn, pkmn, de_pkmn)
    end

    pkmn['entwickelt_aus'] = known_evolutions.fetch(pkmn['id'], 'NULL')

    # The pokemon is now complete and stored for later evolution-lookups
    de_pkmn[pkmn['de']] = pkmn
    STDERR.puts pkmn


    csv << pkmn.values
  end
end

