#!/bin/bash

sqlite3 $1 <<EOF
.mode csv
DELETE FROM person;
DELETE FROM ereignis;
.import person.csv person
.import ereignis.csv ereignis
UPDATE ereignis SET ende_jahr = NULL WHERE ende_jahr = "9999";
UPDATE person SET geschlecht = NULL WHERE geschlecht = '!NULL!';
UPDATE person SET tod_jahr = NULL WHERE tod_jahr = "9999";
VACUUM;
EOF
