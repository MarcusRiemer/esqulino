#!/bin/bash

sqlite3 pokemon_db.db3 << EOF
.mode csv
DELETE FROM move_to_type;
DELETE FROM move;
DELETE FROM pokemon;
DELETE FROM pokemon_to_move;
DELETE FROM pokemon_to_type;
DELETE FROM type;
.import ./csv/move-data.csv move
.import ./csv/move-to-type.csv move_to_type
.import ./csv/pkmn-data.csv pokemon
.import ./csv/pkmn-to-move.csv pokemon_to_move
.import ./csv/type-data.csv type
.import ./csv/pkmn-to-type.csv pokemon_to_type
VACUUM
EOF