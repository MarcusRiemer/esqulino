SELECT Geschichte.geschichte_name, Charakter.charakter_name, Charakter.charakter_id
FROM Geschichte
	JOIN Auftritt
	JOIN Charakter
WHERE Geschichte.geschichte_id = Auftritt.geschichte_id
	AND Charakter.charakter_id = Auftritt.charakter_id
	AND Geschichte.geschichte_id = :geschichte_id