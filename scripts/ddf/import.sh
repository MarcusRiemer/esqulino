#!/bin/bash

#sqlite3 $1 <<EOF
sqlite3 db.sqlite <<EOF
.mode csv
DELETE FROM Auftritt;
DELETE FROM Charakter;
DELETE FROM Sprecher;
DELETE FROM Geschichte;
.import Geschichte.csv Geschichte
.import Sprecher.csv Sprecher
.import Charakter.csv Charakter
.import Auftritt.csv Auftritt
VACUUM
EOF
