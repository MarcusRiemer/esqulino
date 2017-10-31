SELECT *
FROM gefangen
	JOIN pokedex
WHERE gefangen.gefangen_id = :gefangen_id
	AND gefangen.pokedex_nummer = pokedex.nummer