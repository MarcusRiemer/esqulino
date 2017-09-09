SELECT Geschichte.Geschichte_Name, Charakter.Charakter_Name
FROM Auftritt
	JOIN Charakter
	JOIN Geschichte
WHERE Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
	AND Auftritt.Charakter_ID = Charakter.Charakter_ID