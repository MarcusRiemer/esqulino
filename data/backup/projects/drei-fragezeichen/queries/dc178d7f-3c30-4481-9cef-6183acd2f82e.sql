SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name, Geschichte.Geschichte_Nr_Europa
FROM Charakter
	JOIN Auftritt
	JOIN Geschichte
WHERE Charakter.Charakter_ID = Auftritt.Charakter_ID
	AND Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
	AND Charakter.Charakter_ID = :charakter_id