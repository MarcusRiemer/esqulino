require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'

first_url ="https://www.lustiges-taschenbuch.de/ausgaben/alle-ausgaben/ltb-1-der-kolumbusfalter/"
$base_url = "https://www.lustiges-taschenbuch.de"

$tmp_csv = Array.new


def download_info(url_str)
  request_uri = URI.parse(url_str)
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

def get_auflagen(url_str)
  doc = download_info(url_str).xpath('//*[@id="page-top"]/div[2]/div/div[2]/div/ul/li')
    title = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[2]').text
    p title
    doc.each do |x|  
    #p x.text
    #p $base_url + x.child.attribute('href').value
    tmp = download_info($base_url + x.child.attribute('href').value)
    #p "Erscheinen : " + tmp.xpath('//*[@id="page-sidebar"]/div/dl/dd[2]/time').text
    #p "Picture : " + $base_url + tmp.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value
    #p "Pages : " + tmp.xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip

    $tmp_csv << [
      title,
      x.text,
      tmp.xpath('//*[@id="page-sidebar"]/div/dl/dd[2]/time').text,
      $base_url + tmp.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value,
      tmp.xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip
    ]
  end
end

next_url = first_url

for i in 0..50 do
  #p download_info(next_url).xpath('//*[@id="page-top"]/div[2]/div/div[2]/div/ul').text
  get_auflagen(next_url)
  tmp = download_info(next_url)

  len =  tmp.xpath('//*[@id="page-top"]/div[1]/a').length
  next_url = $base_url + tmp.xpath('//*[@id="page-top"]/div[1]/a['+len.to_s+']').attribute('href').value
end

CSV.open("ltb.csv", "w") do |file|
  $tmp_csv.each do |t,a,b,c,d|
    file << [t,a, b, c, d.to_i]
  end
end