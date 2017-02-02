SELECT gefangen.gefangen_id, pokedex.nummer, pokedex.name, gefangen.spitzname, gefangen.staerke, typ.typ_name
FROM gefangen
	JOIN pokedex
	JOIN typ
WHERE gefangen.pokedex_nummer = pokedex.nummer
	AND pokedex.typ1 = typ.typ_id