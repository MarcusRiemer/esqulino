SELECT Sprecher.Sprecher_Name, Charakter.charakter_name
FROM Sprecher
	JOIN Charakter_Sprecher
	JOIN Charakter
WHERE Sprecher.Sprecher_ID = Charakter_Sprecher.Sprecher_Id
	AND Charakter_Sprecher.Charakter_ID = Charakter.charakter_id
	AND Sprecher.Sprecher_ID = :sprecher_id