require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require 'uri'
require 'set'

$base_url = "https://www.lustiges-taschenbuch.de"

first_node = 3829
$last_node = 0
first_url = Net::HTTP.get_response(URI($base_url + '/node/' + first_node.to_s))['location']
last_url = Net::HTTP.get_response(URI($base_url + '/aktuelle-ausgabe'))['location']
exit_loop = false

# ausgabe_nr, Titel, Auflage_NR, Datum, Bild_Path, Seitenanzahl
$tmp_csv = Array.new

# ausgabe_nr, geschichte_code
$book_to_geschichte = Array.new

# geschichte_code, Titel
$tmp_geschichte = Array.new

#$tmp_char = Array.new

# Check existing Geschichten
$tmp_gesch_Set = Set.new()

# Picture URL
$pic_url = Array.new
 

def download_info(url_str)
  request_uri = URI.parse(url_str)
  response = Net::HTTP.get_response(request_uri)

  source = response.body

  doc =  Nokogiri::HTML.parse(source) do |config|
    config.noblanks
  end

  doc
end

def _info(doc,ausgabe_nr,auflagen_nr,title)
  
  story_cnt = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[3]').text.to_i
  erschienen = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[2]/time').text.tr(" \"\t\r\n", '')
  pic_url = '/pics' + doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value
  pages = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip.to_i

  $tmp_csv << [
    ausgabe_nr,
    title,
    auflagen_nr,
    erschienen,
    pic_url,
    pages
  ]

  $pic_url << $base_url + doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value

  # For each Geschichte
  for i in 1..story_cnt do
    code = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[2]/small[3]').text.tr(" \"\t\r\n", '').sub('Code:','')
    story_titel = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[1]/i').text.tr("\t\r\n", '').sub('  ','')
    p story_titel
    $book_to_geschichte << [ausgabe_nr,code]

    # If Geschichte exists
    if !$tmp_gesch_Set.include?(code) then
      $tmp_geschichte << [
        code,
        story_titel
      ]
      $tmp_gesch_Set.add(code)
    end
  
  end
  # Return Node of current URL
  tmp = doc.xpath('/html/head/link[5]').attribute('href').value[/([^\/]+)$/].to_i
  p tmp
  tmp
end

def get_auflagen(url_str)
  # Get Document from URL
  doc = download_info(url_str)
  # Get the Ausgabe Nr
  ausgabe_nr = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[1]').text.tr(" \t\r\n", '').delete('Nr.').to_i
  # Get the HTML-li-elements for the Auflagen
  auflagen_li = doc.xpath('//*[@id="page-top"]/div[2]/div/div[2]/div/ul/li')
  # Get the title
  title = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[2]').text

  tmp_node = false

  auflagen_nr = 1

  # If there are auflagen
  if (!auflagen_li.empty?) then
    auflagen_li.each do |x|  
      # Get the document of the current Auflage
      tmp_doc = download_info($base_url + x.child.attribute('href').value)
      # Get the Nr of the Auflage
      auflagen_nr = x.text.tr('\"\"', '\"').delete('Nr.').to_i
      tmp_node = tmp_node || $last_node == _info(tmp_doc,ausgabe_nr,auflagen_nr,title)
    end
  else
    tmp_node = tmp_node || $last_node == _info(doc,ausgabe_nr,auflagen_nr,title)
  end
  tmp_node
end


$last_node = download_info(last_url).xpath('/html/head/link[5]').attribute('href').value[/([^\/]+)$/].to_i
next_url = first_url
#for i in 0..5 do
p $last_node

while !exit_loop do
  exit_loop = get_auflagen(next_url)

  tmp = download_info(next_url)
  len = tmp.xpath('//*[@id="page-top"]/div[1]/a').length

  next_url = $base_url + tmp.xpath('//*[@id="page-top"]/div[1]/a['+len.to_s+']').attribute('href').value
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
  $pic_url.each do |x|
    file << [x]
  end
end
