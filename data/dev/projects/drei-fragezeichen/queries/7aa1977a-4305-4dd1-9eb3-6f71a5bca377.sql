SELECT Geschichte.Geschichte_Name, Charakter.Charakter_Name, Charakter.Charakter_ID
FROM Geschichte
	JOIN Auftritt
	JOIN Charakter
WHERE Geschichte.Geschichte_ID = Auftritt.Geschichte_ID
	AND Charakter.Charakter_ID = Auftritt.Charakter_ID
	AND Geschichte.Geschichte_ID = :geschichte_id