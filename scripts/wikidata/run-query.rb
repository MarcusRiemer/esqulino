#!/bin/ruby

require 'uri'
require 'net/http'

query = File.open('wikidata-scientists.sparql', 'r') { |f| f.read }

uri = URI.parse('https://query.wikidata.org/bigdata/namespace/wdq/sparql')
params = { :query => query }

uri_full = uri.to_s + '?' + URI.encode_www_form(params)

puts uri_full

req = Net::HTTP::Get.new(uri_full)
req['Accept'] = "text/csv"

res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) {|http|
  http.request(req)
}

puts res.body # <!DOCTYPE html> ... </html> => nil
