SELECT Charakter.charakter_name, Sprecher.Sprecher_Name, Charakter_Sprecher.Sprecher_Id
FROM Charakter
	JOIN Charakter_Sprecher
	JOIN Sprecher
WHERE Charakter.charakter_id = Charakter_Sprecher.Charakter_ID
	AND Charakter_Sprecher.Sprecher_Id = Sprecher.Sprecher_ID
	AND Charakter.charakter_id = :charakter_id