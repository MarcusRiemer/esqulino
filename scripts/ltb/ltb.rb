require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'

first_url ="https://www.lustiges-taschenbuch.de/ausgaben/alle-ausgaben/ltb-1-der-kolumbusfalter/"
base_url = "https://www.lustiges-taschenbuch.de/"
def download_info(url_str)
  request_uri = URI.parse(url_str)
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

#Auflagen
#//*[@id="page-top"]/div[2]/div/div[2]/div/ul
#each li 
#//*[@id="page-top"]/div[2]/div/div[2]/div/ul/li[1]/a

#Nächste Ausgabe
#//*[@id="page-top"]/div[1]/a[2]

#Erscheinung
#//*[@id="page-sidebar"]/div/dl/dd[2]/time


p "Picture : " + download_info(base_url + "ausgaben/alle-ausgaben/ltb-2-das-ewige-feuer/auflage-1").xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value

p "Pages : " + download_info(base_url + "ausgaben/alle-ausgaben/ltb-2-das-ewige-feuer/auflage-1").xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip

#page-sidebar > div > link:nth-child(3)
# Output move_ID,de,en,fr,type_ID
# Downloads a certain episode and represents it as a DOM-parser
