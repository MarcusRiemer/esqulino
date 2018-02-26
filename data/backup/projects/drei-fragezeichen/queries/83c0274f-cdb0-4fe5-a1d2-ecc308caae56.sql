SELECT Charakter.Charakter_Name, Sprecher.Sprecher_Name, Charakter_Sprecher.Sprecher_Id
FROM Charakter
	JOIN Charakter_Sprecher
	JOIN Sprecher
WHERE Charakter.Charakter_ID = Charakter_Sprecher.Charakter_ID
	AND Charakter_Sprecher.Sprecher_Id = Sprecher.Sprecher_ID
	AND Charakter.Charakter_ID = :charakter_id