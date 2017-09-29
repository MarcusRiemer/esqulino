#!/bin/bash

# Grabs all Pokemon-Sprites from greenchu.de, courtesy of
# Daniel von Dombrowski
#
# http://www.pokewiki.de/Pok%C3%A9Wiki:Impressum
#
# Permission requested, but not yet granted.

PKMN_COUNT=721
BASE_URL="http://greenchu.de/sprites/icons"
FIRST=1
LAST=$PKMN_COUNT

echo "Downloading Pokemon images $FIRST to $LAST"

for i in $(seq "$FIRST" "$LAST");
do
    wget -q --random-wait $(printf "%s/%03d.png" "$BASE_URL" "$i")
    echo -n $(printf "%03d" "$i") " "
done

echo ""
echo "Done"
