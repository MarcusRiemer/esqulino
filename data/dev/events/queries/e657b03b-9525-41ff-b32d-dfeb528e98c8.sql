SELECT person_id AS pId, vorname AS pName, *
FROM person
	JOIN ereignis
WHERE person.geb_jahr = ereignis.beginn