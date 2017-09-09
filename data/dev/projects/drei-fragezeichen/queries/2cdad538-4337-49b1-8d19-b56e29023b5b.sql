SELECT Charakter.Charakter_Name, Sprecher.Sprecher_Name
FROM Charakter_Sprecher
	JOIN Charakter
	JOIN Sprecher
WHERE Charakter_Sprecher.Charakter_ID = Charakter.Charakter_ID
	AND Charakter_Sprecher.Sprecher_Id = Sprecher.Sprecher_ID