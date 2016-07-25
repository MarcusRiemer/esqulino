SELECT gefangen.staerke, pokedex.nummer, pokedex.name, pokedex.typ, gefangen.spitzname
FROM gefangen
	JOIN pokedex
WHERE gefangen.pokedex_nummer = pokedex.nummer