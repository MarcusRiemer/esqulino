#!/bin/ruby

require 'uri'
require 'net/http'

require 'byebug'

def query_execute(query_filepath)
  query = File.open(query_filepath, 'r') { |f| f.read }

  STDERR.puts "Executing query:\n#{query}"

  uri = URI.parse('https://query.wikidata.org/sparql')
  params = { :query => query }

  uri_full = uri.to_s + '?' + URI.encode_www_form(params)

  req = Net::HTTP::Get.new(uri_full)
  req['Accept'] = "text/csv"
  req['User-Agent'] = "BlattWerkzeugExampleDataTool/0.1"

  res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) {|http|
    http.request(req)
  }

  STDERR.puts "Resulting HTTP Status: #{res.code}\n"

  return res.body
end

def query_content(query_filepath)
  if not File.exists? query_filepath then
    throw "#{query_filepath} does not exist"
  end

  result_filepath = "#{File.dirname(query_filepath)}/#{File.basename(query_filepath,'.*')}.csv"

  result_cached = File.exists? result_filepath

  if result_cached then
    result_cached = File.ctime(query_filepath) < File.ctime(result_filepath)
  end

  if not result_cached then
    res = query_execute(query_filepath)
    File.write(result_filepath, res)
    res
  else
    STDERR.puts "Reading cache from \"#{result_filepath}\""
    File.open(result_filepath, 'r') { |f| f.read }
  end
end

if __FILE__ == $0
  puts query_content(ARGV[0])
end
