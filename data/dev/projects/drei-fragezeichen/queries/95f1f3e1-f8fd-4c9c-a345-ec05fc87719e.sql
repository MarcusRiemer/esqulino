SELECT Geschichte.geschichte_name, Charakter.charakter_vorname, Charakter.charakter_nachname
FROM Auftritt
	JOIN Charakter
	JOIN Geschichte
WHERE Auftritt.geschichte_id = Geschichte.geschichte_id
	AND Auftritt.charakter_id = Charakter.charakter_id