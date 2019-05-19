#!/bin/bash

sqlite3 ltb.sql <<EOF
.mode csv
DELETE FROM auflagen
.import ltb.csv azflagen

VACUUM;
EOF
