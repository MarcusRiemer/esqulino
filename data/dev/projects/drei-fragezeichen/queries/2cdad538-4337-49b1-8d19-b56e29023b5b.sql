SELECT Charakter.charakter_name, Sprecher.Sprecher_Name
FROM Charakter_Sprecher
	JOIN Charakter
	JOIN Sprecher
WHERE Charakter_Sprecher.Charakter_ID = Charakter.charakter_id
	AND Charakter_Sprecher.Sprecher_Id = Sprecher.Sprecher_ID