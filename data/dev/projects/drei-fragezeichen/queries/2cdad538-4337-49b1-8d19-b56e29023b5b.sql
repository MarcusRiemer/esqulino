SELECT Charakter.charakter_vorname, Charakter.charakter_nachname, Sprecher.Sprecher_Vorname, Sprecher.Sprecher_Nachname
FROM Charakter_Sprecher
	JOIN Charakter
	JOIN Sprecher
WHERE Charakter_Sprecher.Charakter_ID = Charakter.charakter_id
	AND Charakter_Sprecher.Sprecher_Id = Sprecher.Sprecher_ID