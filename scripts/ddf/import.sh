#!/bin/bash

sqlite3 $1 <<EOF
.mode csv
DELETE FROM Auftritt;
DELETE FROM Charakter_Sprecher;
DELETE FROM Charakter;
DELETE FROM Sprecher;
DELETE FROM Geschichte;
.import Geschichte.csv Geschichte
.import Sprecher.csv Sprecher
.import Charakter.csv Charakter
.import Charakter_Sprecher.csv Charakter_Sprecher
.import Auftritt.csv Auftritt
VACUUM
EOF
