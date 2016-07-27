SELECT gefangen.gefangen_id, pokedex.nummer, pokedex.name, pokedex.typ, gefangen.spitzname, gefangen.staerke
FROM gefangen
	JOIN pokedex
WHERE gefangen.pokedex_nummer = pokedex.nummer