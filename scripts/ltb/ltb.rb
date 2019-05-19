require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'
require 'set'

first_url ="https://www.lustiges-taschenbuch.de/ausgaben/alle-ausgaben/ltb-1-der-kolumbusfalter/"
#first_url = "https://www.lustiges-taschenbuch.de/ausgaben/alle-ausgaben/ltb-240-die-glorreiche-gaense-garde/"
$base_url = "https://www.lustiges-taschenbuch.de"

$tmp_csv = Array.new
$book_to_geschichte = Array.new
$tmp_geschichte = Array.new
$tmp_char = Array.new
$tmp_gesch_Set = Set.new()
$tmp_url = Array.new


def download_info(url_str)
  request_uri = URI.parse(url_str)
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

def _info(doc,nr,auflage)
  title = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[2]').text

  $tmp_csv << [
    nr,
    title,
    auflage,
    doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[2]/time').text.tr(" \"\t\r\n", ''),
    '/pics/'+doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value,
    doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip
  ]

  $tmp_url << $base_url + doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value
  
  for i in 1..(doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[3]')).text.to_i do
    code = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[2]/small[3]').text.tr(" \"\t\r\n", '').sub('Code:','')
    g_titel = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[1]/i').text.tr(" \t\r\n", '')

    $book_to_geschichte << [nr,code]

    if !$tmp_gesch_Set.include?(code) then
    $tmp_geschichte << [
      code,
      g_titel
    ]
    $tmp_gesch_Set.add(code)
    end
  
  end
end

def get_auflagen(url_str)
  doc = download_info(url_str)
  nr = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[1]').text.tr(" \t\r\n", '').delete('Nr.').to_i
  tmp_doc = doc.xpath('//*[@id="page-top"]/div[2]/div/div[2]/div/ul/li')

  if (tmp_doc.empty?)then
    _info(doc,nr,1)
  else
    doc = tmp_doc
    doc.each do |x|  
    tmp = download_info($base_url + x.child.attribute('href').value)
    _info(tmp,nr,x.text.tr('\"\"', '\"').delete('Nr.').to_i)
    end
  end
end

# //*[@id="page-top"]/div[1]/div[2]/h1/span[1]
# //*[@id="page-content"]/div[2]/table/tbody[3]/tr/td[1]/div/div[2]/small[3]/text()

next_url = first_url

for i in 0..500 do
  #p i
  get_auflagen(next_url)
  tmp = download_info(next_url)

  len = tmp.xpath('//*[@id="page-top"]/div[1]/a').length

  next_url = $base_url + tmp.xpath('//*[@id="page-top"]/div[1]/a['+len.to_s+']').attribute('href').value
  
  p next_url
end

CSV.open("ltb.csv", "w") do |file|
  $tmp_csv.each do |t,a,b,c,d,e|
    file << [t.to_i,a, b, c, d,e.to_i]
  end
end

CSV.open("ltb-geschichten.csv", "w") do |file|
  $tmp_geschichte.each do |x,y|
    file << [x,y]
  end
end

CSV.open("ltb-buch-gesch.csv", "w") do |file|
  $book_to_geschichte.each do |x,y|
    file << [x,y]
  end
end

CSV.open("ltb-url.csv", "w") do |file|
  $tmp_url.each do |x|
    file << [x]
  end
end
