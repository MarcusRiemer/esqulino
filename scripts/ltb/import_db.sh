#!/bin/bash

sqlite3 ltb_db.db3 << EOF
.mode csv
DELETE FROM ausgaben;
DELETE FROM buch_to_geschichte;
DELETE FROM geschichten;
.import ltb.csv ausgaben
.import ltb-buch-gesch.csv buch_to_geschichte
.import ltb-geschichten.csv geschichten
VACUUM
EOF

