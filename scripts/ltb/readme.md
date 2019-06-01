# LTB-Data

Fetches the data for every LTB book, all the stories and characters inside.

## Getting Started

ltb.rb generates :
  ltb-buch-gesch.csv
  ltb-geschichten.csv
  ltb-url.csv
  ltb.csv
downloader.rb downloads all pictures from urls in ltb-url.csv

import_db.sh imports all csv data into ltb_db.db3