#!/bin/ruby
# coding: utf-8

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

# book_nmbr, Titel, Auflage_NR, Datum, Bild_Path, Seitenanzahl
$tmp_csv = Array.new

# book_nmbr, story_code
$book_to_story = Array.new

# story_code, Titel
$tmp_story = Array.new

$tmp_char = Hash.new

$story_to_char = Array.new

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

def _info(doc,book_nmbr,edition_nmbr,title)
  
  story_cnt = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[3]').text.to_i
  release_date = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[2]/time').text.tr(" \"\t\r\n", '')
  page_cnt = doc.xpath('//*[@id="page-sidebar"]/div/dl/dd[4]').text.strip.to_i
  book_id = $tmp_csv.length + 1
  # Return Node of current URL
  current_node = doc.xpath('/html/head/link[5]').attribute('href').value[/([^\/]+)$/].to_i

  $tmp_csv << [
    book_id,
    book_nmbr,
    edition_nmbr,
    title,
    release_date,
    page_cnt,
    current_node
  ]

  $pic_url << [
    book_id,
    $base_url + doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value,
    doc.xpath('//*[@id="page-sidebar"]/div/link[1]').attribute('href').value[/([^\/]+)$/]
]

  # For each story
  for i in 1..story_cnt do
    # Each story has a numerating tbody
      code = nil
      genre = nil
      orig_title = nil
      orig_country = nil
      story_page_cnt = nil
      chars = Array.new
      curr_story = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[2]/small')
      story_title = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[1]/i').text.tr("\t\r\n", '').gsub(/  +/, "")
      story_id = $tmp_story.length + 1
      if curr_story.nil?

      else
      #story_title = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[1]/i').text.tr("\t\r\n", '').gsub(/  +/, "")
      curr_story.each do |small|
        tmp_small = small.text.tr("\"\t\r\n", '').gsub(/  +/, "").split(':')
        case tmp_small[0]
          when "Code"
            code = tmp_small[1]
          when "Genre"
            genre = tmp_small[1]
          when "Originaltitel"
            orig_title = tmp_small[1]
          when "Ursprung"
            orig_country = tmp_small[1]
          when "Seitenanzahl"
            story_page_cnt = tmp_small[1]
          when "Charaktere"
            chars = doc.xpath('//*[@id="page-content"]/div[2]/table/tbody['+(i+1).to_s+']/tr/td[1]/div/div[2]/small[2]/span')
          end
      end
      
      
      $book_to_story << [book_id,story_id]

      # For each character in currenty story
      chars.each do |span|
        char_name = span.text
        # Does the character name already occur?
        if not $tmp_char.key? char_name then
        $tmp_char[char_name] = $tmp_char.length + 1
        #p char_name
      end

        char_id = $tmp_char[char_name]
        $story_to_char << [story_id, char_id]
      end
    end
    $tmp_story << [
      story_id,
      code,
      story_title,
      genre,
      orig_title,
      orig_country,
      story_page_cnt
    ]
  end

  #p tmp
  current_node
end

def get_auflagen(url_str)
  # Get Document from URL
  doc = download_info(url_str)
  # Get the Ausgabe Nr
  book_nmbr = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[1]').text.tr(" \t\r\n", '').delete('Nr.').to_i
  puts "Book Nr. : " + book_nmbr.to_s
  # Get the HTML-li-elements for the Auflagen
  edition_li = doc.xpath('//*[@id="page-top"]/div[2]/div/div[2]/div/ul/li')
  # Get the title
  title = doc.xpath('//*[@id="page-top"]/div[1]/div[2]/h1/span[2]').text

  tmp_node = false

  # If there are editions
  if (!edition_li.empty?) then
    edition_li.each do |x|  
      # Get the document of the current book
      tmp_doc = download_info($base_url + x.child.attribute('href').value)
      # Get the number of the edition 
      edition_nmbr = x.text.tr('\"\"', '\"').delete('Nr.').to_i

      tmp_node = tmp_node || $last_node == _info(tmp_doc,book_nmbr,edition_nmbr,title)
    end
  else
    tmp_node = tmp_node || $last_node == _info(doc,book_nmbr,1,title)
  end
  tmp_node
end


$last_node = download_info(last_url).xpath('/html/head/link[5]').attribute('href').value[/([^\/]+)$/].to_i
next_url = first_url

while !exit_loop do
  exit_loop = get_auflagen(next_url)

  tmp = download_info(next_url)
  len = tmp.xpath('//*[@id="page-top"]/div[1]/a').length

  next_url = $base_url + tmp.xpath('//*[@id="page-top"]/div[1]/a['+len.to_s+']').attribute('href').value
end

CSV.open("ltb.csv", "w") do |file|
  $tmp_csv.each do |t,a,b,c,d,e,f|
    file << [t.to_i,a, b.to_i, c, d,e.to_i,f]
  end
end

CSV.open("ltb-story.csv", "w") do |file|
  $tmp_story.each do |x,y,z,a,b,c,d|
    file << [x.to_i,y,z,a,b,c,d.to_i]
  end
end

CSV.open("ltb-book-story.csv", "w") do |file|
  $book_to_story.each do |x,y|
    file << [x.to_i,y.to_i]
  end
end

CSV.open("ltb-story-char.csv", "w") do |file|
  $story_to_char.each do |x,y|
    file << [x.to_i,y.to_i]
  end
end

CSV.open("ltb-char.csv", "w") do |file|
  $tmp_char.each do |x,y|
    file << [y.to_i,x]
  end
end

CSV.open("ltb-url.csv", "w") do |file|
  $pic_url.each do |x,y,z|
    file << [x,y,z]
  end
end
