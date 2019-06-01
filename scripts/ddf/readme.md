# DDF-Data

Gets data for three investigatior audiobooks.

## Getting Started

ddf-data-stories.rb 
  Fetches all stories and stores them in Geschichte.csv
  Takes 2 arguments: start and end of storynumber. (e.g. "ddf-data-stories.rb 1 198")
ddf-data-characters.rb
  Auftritt.csv, Character.csv, Sprecher.csv uses Geschichten.csv
import.sh 
  Imports all csv-files into db.sqlite
