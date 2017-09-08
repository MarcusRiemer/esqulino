SELECT Charakter.charakter_name, Geschichte.geschichte_name, Geschichte.geschichte_nr_europa
FROM Charakter
	JOIN Auftritt
	JOIN Geschichte
WHERE Charakter.charakter_id = Auftritt.charakter_id
	AND Auftritt.geschichte_id = Geschichte.geschichte_id
	AND Charakter.charakter_id = :charakter_id