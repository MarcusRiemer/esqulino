SELECT p.person_id AS pId, p.vorname AS pName
FROM person p
	JOIN ereignis e
WHERE person.geb_jahr = ereignis.beginn