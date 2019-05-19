require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'

def fetch(url_in)

  tmp = JSON.parse(Nokogiri::HTML(open(url_in)))
  tmp_count = tmp['count']
  result = tmp['results']
    
  puts '### -- Fetching List from ' + url_in
  
  while !tmp['next'].nil? do
      tmp = JSON.parse(Nokogiri::HTML(open(tmp['next'])))
      result.concat(tmp['results']) 
  end
  
  puts '  Count:   ' + tmp_count.to_s
  puts '  Results: ' + result.length.to_s
  
  if tmp_count != result.length
    puts '### -- WARNING: Please check the difference!'
  end

  puts '### -- Fetching done.'
  return result
end

def output_progress(i,total,steps)
  x = total / steps
  if (i + 1) % x == 0 then 
    puts 'Item: ' + (i + 1).to_s + ' at ' + (((i + 1) * 100 / total) + 1).to_s + "%" 
  end
end