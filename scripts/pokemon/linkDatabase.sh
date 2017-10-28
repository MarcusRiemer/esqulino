#!/bin/bash


table=pokedex

IFS=$'\n'
set -f
for line in `cat < "$1"`
do
	i=`echo "$line" | cut -d ',' -f 1`
	uuid=`echo "$line" | cut -d ',' -f 2`
	echo "$line"
	sqlite3 "$2" "update or rollback pokedex set bild = \"$uuid\" where nummer == $i;"
done
