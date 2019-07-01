#!/bin/bash

sqlite3 ltb_db.db3 << EOF
.mode csv
DELETE FROM ausgabe;
DELETE FROM ausgabe_to_geschichte;
DELETE FROM bild_url;
DELETE FROM charakter;
DELETE FROM geschichte;
DELETE FROM geschichte_to_charakter;
.import ltb.csv ausgabe
.import ltb-book-story.csv ausgabe_to_geschichte
.import ltb-url.csv bild_url
.import ltb-char.csv charakter
.import ltb-story.csv geschichte
.import ltb-story-char.csv geschichte_to_charakter 
VACUUM
EOF

